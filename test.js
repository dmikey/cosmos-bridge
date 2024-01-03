const bech32 = require("bech32");

const decodeAkashAddressEtherBase = (address) => {
  try {
    const { words, prefix } = bech32.decode(address);
    const data = bech32.fromWords(words);
    return "0x" + Buffer.from(data).toString("hex");
  } catch (error) {
    return error;
  }
};

const encodeEthBaseAkashAddress = (base) => {
  const words = bech32.toWords(Buffer.from(base, "hex"));
  const data = bech32.encode("akash", words);
  return data;
};

console.log(
  decodeAkashAddressEtherBase("akash1y2szgnfj693s0z5r8w69cuvkmujtmdap4qw65r")
);
console.log(
  encodeEthBaseAkashAddress("22a0244d32d163078a833bb45c7196df24bdb7a1")
);
