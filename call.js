solc = require("solc");
fs = require("fs");
Web3 = require("web3");

web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

fileContent = fs.readFileSync("Add.sol").toString();
// console.log(fileContent);

var input = {
  language: "Solidity",
  sources: {
    "Add.sol": {
      content: fileContent,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

var output = JSON.parse(solc.compile(JSON.stringify(input)));
// console.log("output",output);

ABI = output.contracts["Add.sol"]["Add"].abi;
bytecode = output.contracts["Add.sol"]["Add"].evm.bytecode.object;

// console.log("aaa", ABI);

contract = new web3.eth.Contract(ABI);
var defaultAccount;

web3.eth.getAccounts().then((accounts) => {
  console.log("Accounts", accounts);
  defaultAccount = accounts[0];
  console.log("DefaultAccounts ", defaultAccount);

  contract
    .deploy({ data: bytecode })
    .send({ from: defaultAccount, gas: 4000000 })
    .on("receipt", (receipt) => {
      console.log("ContractAdress:", receipt.contractAddress);
    })
    .then((addContract) => {
      addContract.methods.getSum().call((err, sum) => {
        console.log("initialsum:", sum);
      });
      addContract.methods.Sum(7, 7).send(
        {
          from: defaultAccount,
        },
        () => {
          addContract.methods.getSum().call((err, sum) => {
            console.log("finalSum", sum);
          });
        }
      );
    });
});
