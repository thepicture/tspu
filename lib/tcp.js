class Session {
  magic = {
    openvpn: [0x04, 0x00, 0x00, 0x00],
  };

  bytes = [];
  extensions = [];

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

    return this;
  }

  extend(...arrayOrArguments) {
    const extension = [];

    arrayOrArguments.forEach((argument) => {
      if (ArrayBuffer.isView(argument)) {
        extension.push(...argument);
      }

      if (Array.isArray(argument)) {
        extension.push(...argument);
      }

      if (Number.isInteger(argument)) {
        extension.push(argument);
      }
    });

    this.extensions.push(extension);

    return this;
  }

  blocked() {
    if (this.extensions.length) {
      const didSomeExtensionsMatch = this.extensions.some((extension) => {
        return this.bytes
          .slice(0, extension.length)
          .every((byte, index) => extension[index] === byte);
      });

      if (didSomeExtensionsMatch) {
        return true;
      }
    }

    return Object.values(this.magic).some((magic) => {
      return this.bytes
        .slice(0, this.magic.openvpn.length)
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
