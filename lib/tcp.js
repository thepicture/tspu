class Session {
  magic = {
    openvpn: [0x04, 0x00, 0x00, 0x00],
  };

  bytes = [];

  feed(...arrayOrArguments) {
    arrayOrArguments.forEach((argument) => {
      if (ArrayBuffer.isView(argument)) {
        this.bytes.push(...argument);
      }

      if (Array.isArray(argument)) {
        this.bytes.push(...argument);
      }

      if (Number.isInteger(argument)) {
        this.bytes.push(argument);
      }
    });

    this.#trimState();
  }

  blocked() {
    return Object.values(this.magic).some((magic) => {
      return this.bytes
        .slice(0, 4)
        .every((byte, index) => magic[index] === byte);
    });
  }

  #trimState() {
    this.bytes = this.bytes.slice(this.bytes.findIndex(Boolean));
  }
}

module.exports = {
  Session,
};
