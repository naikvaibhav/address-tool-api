const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const response = require("../libs/responseLib");
const logger = require("../libs/loggerLib");
const check = require("../libs/checkLib");

const filePath = path.join(__dirname, '../../pincodes.csv');

//start validaion function
let validateFunction = async(req, res) => {
    const extract_pincode = (address) => {
        const pattern = /\b(\d{6})\b/;
        const matches = address.match(pattern);
        if (matches) {
          return matches[0];
        }
        return null;
      }

    const find_pincode_data = (pincode, csv_file) => {
    //use promise to read the csv file as the createReadStream is an async fn
    return new Promise((resolve, reject) => {
        try {
            const results = [];
            fs.createReadStream(csv_file)
            .pipe(csv({
                mapHeaders: ({ header, index }) => header.toLowerCase()
            }))//convert the csv headers to lowercase to avoid syntax errors
            .on('data', (row) => {
                //check whether pincode is found
                if (row.pincode === pincode) results.push(row);
            })
            .on('end', () => {
                //get the first option from the list of matched results
                const [first] = results;
                //return the result
                resolve(results.length > 0 ? Object.values(first) : null)
            });
    
        } catch (error) {
            let apiResponse = response.generate(
                true,
                'Failed to parse the CSV file for address list',
                500,
                null
              );
            reject(apiResponse)
        }
    })
    
    }

    const split_address_words = (address) => {
        const pattern = /[,/\s]+/;
        const words = address.toLowerCase().split(pattern).filter(Boolean);
        return [...new Set(words)];
    }

    const detect_landmark = (address) => {
        const landmark_words = ["behind", "near", "nearby", "opposite", "across", "next to", "beside", "in front of", "close to", "hospital", "restaurant", "hotel", "post office", "signal", "airport", "station", "gate", "inn", "soc", "chowk", "kendra", "gym", "temple", "banglow", "chaal", "bridge", "residency", "market", "showroom", "mandir"];
        for (const word of landmark_words) {
          if (address.toLowerCase().includes(word)) {
            return true;
          }
        }
        return false;
    }

    const detect_unit_numbers = (address) => {
        const pattern = /(?i)(?<!\w)(unit|apt|apartment|room|flat|suite|\d{1,3})(?=\W)/g;
        const matches = address.match(pattern);
        console.log('matches', matches)
        //   const unit_numbers = matches ? matches.map(match => match.toUpperCase()) : [];
        //   return unit_numbers;
      }

    const verify_address = (address) => {
        if (detect_landmark(address)) {
         return "Address verified - proceed to delivery";
        } else {
          return "The address needs to be verified because: No landmark found";
        }
    }

    const lowercaseArray = (array) => {
    return array.map(element => {
        return element.toLowerCase();
    });
    }

    if(check.isEmpty(req.body)){
      let apiResponse = response.generate(
        true,
        "The request body is empty, address key is required property",
        400,
        null
      );
      return res.send(apiResponse)
    }

    const {address} = req.body
    const pincode = extract_pincode(address);
    const csv_file_path = filePath;
  
    if (check.isEmpty(address)) {
        let apiResponse = response.generate(
            true,
            "Please enter an address",
            400,
            null
          );
        return res.send(apiResponse)
    } 
    if (!pincode) {
        let apiResponse = response.generate(
            false,
            "The address needs to be verified because: No pincode found.",
            200,
            null
          );
        return res.send(apiResponse)
    }
  
  
    const addressmatch = await find_pincode_data(pincode, csv_file_path);
  
    if (!addressmatch) {
        let apiResponse = response.generate(
            false,
            `The pincode ${pincode} does not have associated data in the records`,
            200,
            null
          );
        return res.send(apiResponse)
    }
  
    // console.log('addressmatch', addressmatch)
    // console.log(`The pincode ${pincode} exists in the records`)
    const address_words = split_address_words(address);
    const addressmatch_words = [...new Set(lowercaseArray(addressmatch))]
    // console.log('address_words', address_words)
    // console.log('addressmatch', addressmatch_words)
    const common_words = address_words.filter(word => addressmatch_words.includes(word))
    // console.log('common_words', common_words)

    if (common_words && common_words.length > 0) {
      // console.log("Verifing the landmark and unit number...");
      let apiResponse = response.generate(
          false,
          verify_address(address),
          200,
          {
              info: `common_words found between the user entered address & matched address are the following: ${common_words.toString()}`
          }
        );
      return res.send(apiResponse)
    } else {
      let apiResponse = response.generate(
          false,
          "The address needs to be verified because: City information needs verification.",
          200,
          null
        );
      return res.send(apiResponse)
    }
}

module.exports = {
    validateFunction
}