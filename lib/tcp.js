const { EventEmitter } = require("node:events");

const grasshopper = require("./grasshopper");

class Session extends EventEmitter {
  magic = {
    openvpn: [0x04, 0x00, 0x00, 0x00],
  };
  bytes = [];
  extensions = [];
  sensitivity = 1;
  feedCiphers = [];
  autoblock = false;
  bannedCiphers = [];

  constructor(options) {
    super(options);

    if (typeof options !== "undefined") {
      this.autoblock = true;

      if (typeof options.sensitivity !== "undefined") {
        this.sensitivity = options.sensitivity;
      }
    }
  }

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

  feedCipher(ciphers, triggerEvents = true) {
    this.feedCiphers.push(ciphers);

    if (triggerEvents && this.listenerCount("blocked") && this.blocked()) {
      this.emit("blocked", { ciphers });
    }

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

  banCipher(ciphers) {
    this.bannedCiphers.push(ciphers);

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

    if (this.bannedCiphers.length && this.feedCiphers.length) {
      const areSomeCiphersBanned = this.feedCiphers.some((feedCipher) => {
        return this.bannedCiphers.some(
          (bannedCipher) =>
            bannedCipher.length === feedCipher.length &&
            bannedCipher.every(
              (encryptionProtocol, index) =>
                feedCipher[index] === encryptionProtocol
            )
        );
      });

      const areSomeCiphersSimilar =
        this.autoblock &&
        this.feedCiphers.some((feedCipher) =>
          this.bannedCiphers.some((bannedCipher) => {
            const isSimilarCipher = grasshopper.compare(
              feedCipher,
              bannedCipher
            );

            const { stringify } = JSON;

            const includesCipher = this.bannedCiphers.some(
              (cipher) => stringify(cipher) === stringify(feedCipher)
            );

            if (isSimilarCipher && !includesCipher) {
              this.feedCipher(
                feedCipher,
                { triggerEvents: false }.triggerEvents
              );
            }

            return (
              grasshopper.compare(feedCipher, bannedCipher) <= this.sensitivity
            );
          })
        );

      if (areSomeCiphersBanned || areSomeCiphersSimilar) {
        return true;
      }
    }

    if (!this.bytes.length) {
      return false;
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
