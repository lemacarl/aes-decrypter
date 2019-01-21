/*!
 *
 *  AES Decrypter
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */

/**
 * Display toast using Materialize
 * @param {*} message Toast message
 */
function displayToast(message) {
  M.toast({
    html: message
  });
}

/**
 * Decrypt file using CryptoJS
 * @param {*} file File object
 * @param {*} password Password
 */
function decryptFile(file, password) {
  const reader = new FileReader();
  const inputType = document
    .querySelector('input[name="input-type"]:checked')
    .value;

  // Change reader method based on input type
  if ('hex' === inputType) {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file);
  }
  reader.onload = e => {
    const pass = CryptoJS.enc.Utf8.parse(password);
    let cipherText;

    // Render cipher text based on input type
    if ('hex' === inputType) {
      cipherText = CryptoJS.lib.WordArray.create(e.target.result);
    } else {
      cipherText = e.target.result;
    }

    // Decrypted file
    let decrypted = getDecryptedOutput({
      cipherText: cipherText,
      pass: pass,
      type: inputType
    });

    // Filter output based on input type
    let output = filterOutput(decrypted, inputType);
    const blob = new Blob([output], {
      type: 'application/octet-stream'
    });

    let blobUrl = URL.createObjectURL(blob);
    download(file.name, blobUrl);
  };
}

/**
 * Trigger file download
 * @param {String} name File name
 * @param {String} url URL
 */
function download(name, url) {
  const anchor = document.getElementById('download');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
}

/**
 * Decrypt cipher text
 * @param {*} args Object with arguments
 * @return {*} Object
 */
function getDecryptedOutput(args) {
  let decrypted;
  if ('hex' === args.type) {
    decrypted = CryptoJS.AES.decrypt({
      ciphertext: args.cipherText
    },
    args.pass, {
      iv: args.pass,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
  } else {
    decrypted = CryptoJS.AES.decrypt(args.cipherText, args.pass, {
      iv: args.pass,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
  }
  return decrypted;
}

/**
 * Filter output based on type
 * @param {*} decrypted Decryptor
 * @param {*} type Input type
 * @return {*} String
 */
function filterOutput(decrypted, type) {
  let output;
  switch (type) {
    case 'hex':
      output = reorganizeHexValues(decrypted.toString(CryptoJS.enc.Hex));
      break;
    case 'b64':
      output = decrypted.toString(CryptoJS.enc.Base64);
      break;
    case 'utf-8':
      output = decrypted.toString(CryptoJS.enc.Utf8);
      break;
    default:
      output = decrypted.toString();
  }
  return output;
}

/**
 * Reorganize hex values to correct format
 * @param {String} values String
 * @return {String} organized hex values
 */
function reorganizeHexValues(values) {
  let output = '';
  let columnCount = 0;
  for (let i = 0; i < values.length; i += 4) {
    columnCount++;
    output += values[i] + values[i + 1] + values[i + 2] + values[i + 3];
    if (columnCount === 8) {
      columnCount = 0;
      output += '\n';
    } else {
      output += ' ';
    }
  }
  return output;
}

(function() {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );

  if ('serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      // updatefound is fired if service-worker.js changes.
      registration.onupdatefound = function() {
        // updatefound is also fired the very first time the SW is installed,
        // and there's no need to prompt for a reload at that point.
        // So check here to see if the page is already controlled,
        // i.e. whether there's an existing service worker.
        if (navigator.serviceWorker.controller) {
          // The updatefound event implies that registration.installing is set:
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          var installingWorker = registration.installing;

          installingWorker.onstatechange = function() {
            switch (installingWorker.state) {
              case 'installed':
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case 'redundant':
                throw new Error('The installing ' +
                                'service worker became redundant.');

              default:
                // Ignore
            }
          };
        }
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  }

  // Your custom JavaScript goes here
  const fileUpload = document.getElementById('file-upload');
  const fileName = document.getElementById('file-name');
  const password = document.getElementById('password');
  const btnDecrypt = document.getElementById('btn-decrypt');

  fileUpload.addEventListener('change', () => {
    fileName.value = fileUpload.files[0].name;
  });

  btnDecrypt.addEventListener('click', e => {
    e.preventDefault();

    if (!fileUpload.files[0]) {
      displayToast('Please select a file.');
      return;
    }
    if (!password.value) {
      displayToast('Please enter a password.');
      return;
    }
    const file = fileUpload.files[0];
    fileName.value = file.name;

    decryptFile(file, password.value);
  });
})();
