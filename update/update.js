"use strict";


const WORLDTV_VERSION = "1.0.0";


async function checkForUpdates(
  showResult = false
) {

  try {

    const response =
      await fetch(
        "update/version.json",
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "Update information unavailable."
      );

    }


    const remote =
      await response.json();


    updateVersionDisplay();


    const comparison =
      compareVersions(
        remote.version,
        WORLDTV_VERSION
      );


    if (comparison > 0) {

      if (showResult) {

        const message =
          `WorldTV ${remote.version} is available.`;

        if (
          remote.downloadUrl
        ) {

          const confirmed =
            window.confirm(
              `${message}\n\nOpen update page?`
            );

          if (
            confirmed
          ) {

            window.open(
              remote.downloadUrl,
              "_blank"
            );

          }

        } else {

          alert(
            `${message}\n\nDownload URL has not been configured yet.`
          );

        }

      }

      return {
        available: true,
        version: remote.version,
        notes: remote.releaseNotes || []
      };

    }


    if (showResult) {

      alert(
        `WorldTV is up to date.\n\nVersion ${WORLDTV_VERSION}`
      );

    }


    return {
      available: false,
      version: WORLDTV_VERSION
    };


  } catch (error) {

    console.error(
      "Update check failed:",
      error
    );


    if (showResult) {

      alert(
        "Unable to check for updates."
      );

    }


    return {
      available: false,
      error: true
    };

  }

}


function compareVersions(
  first,
  second
) {

  const a =
    String(first)
      .split(".")
      .map(Number);

  const b =
    String(second)
      .split(".")
      .map(Number);


  const length =
    Math.max(
      a.length,
      b.length
    );


  for (
    let i = 0;
    i < length;
    i++
  ) {

    const x =
      Number.isFinite(a[i])
        ? a[i]
        : 0;

    const y =
      Number.isFinite(b[i])
        ? b[i]
        : 0;


    if (x > y) {
      return 1;
    }

    if (x < y) {
      return -1;
    }

  }


  return 0;

}


function updateVersionDisplay() {

  const element =
    document.getElementById(
      "appVersion"
    );


  if (element) {

    element.textContent =
      WORLDTV_VERSION;

  }

}


window.addEventListener(
  "DOMContentLoaded",
  () => {

    updateVersionDisplay();

    checkForUpdates(false);

  }
);
