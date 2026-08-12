"use strict";

/*
  WorldTV HDMI Stick
  Front-end application

  IMPORTANT:
  Only add streams that you own,
  operate, or have permission to distribute.
*/


const state = {

  channels: [],

  categories: [],

  currentCategory: "all",

  currentChannel: null,

  searchTerm: "",

  autoplay: true,

  rememberChannel: true

};


const elements = {

  video: document.getElementById("videoPlayer"),

  playerMessage:
    document.getElementById("playerMessage"),

  loading:
    document.getElementById("loadingIndicator"),

  channelGrid:
    document.getElementById("channelGrid"),

  categoryNav:
    document.getElementById("categoryNav"),

  categoryTitle:
    document.getElementById("categoryTitle"),

  channelCount:
    document.getElementById("channelCount"),

  currentChannelName:
    document.getElementById("currentChannelName"),

  currentChannelDescription:
    document.getElementById(
      "currentChannelDescription"
    ),

  searchPanel:
    document.getElementById("searchPanel"),

  searchInput:
    document.getElementById("searchInput"),

  settingsModal:
    document.getElementById("settingsModal"),

  autoplaySetting:
    document.getElementById("autoplaySetting"),

  rememberSetting:
    document.getElementById("rememberSetting"),

  appVersion:
    document.getElementById("appVersion"),

  toast:
    document.getElementById("toast")

};


document.addEventListener(
  "DOMContentLoaded",
  init
);


async function init() {

  loadSettings();

  bindEvents();

  await loadCategories();

  await loadChannels();

  restoreLastChannel();

}


function bindEvents() {

  document
    .getElementById("searchButton")
    .addEventListener(
      "click",
      toggleSearch
    );


  document
    .getElementById("clearSearch")
    .addEventListener(
      "click",
      clearSearch
    );


  elements.searchInput
    .addEventListener(
      "input",
      event => {

        state.searchTerm =
          event.target.value
            .trim()
            .toLowerCase();

        renderChannels();

      }
    );


  document
    .getElementById("settingsButton")
    .addEventListener(
      "click",
      openSettings
    );


  document
    .getElementById("closeSettings")
    .addEventListener(
      "click",
      closeSettings
    );


  document
    .getElementById("fullscreenButton")
    .addEventListener(
      "click",
      fullscreenVideo
    );


  elements.autoplaySetting
    .addEventListener(
      "change",
      saveSettings
    );


  elements.rememberSetting
    .addEventListener(
      "change",
      saveSettings
    );


  document
    .getElementById("checkUpdateButton")
    .addEventListener(
      "click",
      async () => {

        if (
          typeof checkForUpdates ===
          "function"
        ) {

          await checkForUpdates(true);

        }

      }
    );


  elements.video.addEventListener(
    "waiting",
    () => {

      elements.loading
        .classList
        .remove("hidden");

    }
  );


  elements.video.addEventListener(
    "playing",
    () => {

      elements.loading
        .classList
        .add("hidden");

      elements.playerMessage
        .classList
        .add("hidden");

    }
  );


  elements.video.addEventListener(
    "error",
    () => {

      elements.loading
        .classList
        .add("hidden");

      showToast(
        "Unable to play this stream."
      );

    }
  );


  document.addEventListener(
    "keydown",
    handleKeyboard
  );

}


async function loadCategories() {

  try {

    const response =
      await fetch(
        "data/categories.json"
      );

    if (!response.ok) {
      throw new Error(
        "Category file unavailable"
      );
    }

    state.categories =
      await response.json();

  } catch (error) {

    console.error(error);

    state.categories = [
      {
        id: "all",
        name: "All"
      }
    ];

  }

  renderCategories();

}


async function loadChannels() {

  try {

    const response =
      await fetch(
        "channels.json"
      );

    if (!response.ok) {
      throw new Error(
        "Channel file unavailable"
      );
    }

    state.channels =
      await response.json();

  } catch (error) {

    console.error(error);

    state.channels = [];

    showToast(
      "Channel database could not be loaded."
    );

  }

  renderChannels();

}


function renderCategories() {

  elements.categoryNav.innerHTML = "";

  state.categories.forEach(
    category => {

      const button =
        document.createElement("button");

      button.className =
        "category-button";

      if (
        category.id ===
        state.currentCategory
      ) {

        button.classList.add(
          "active"
        );

      }

      button.textContent =
        category.name;

      button.dataset.category =
        category.id;

      button.addEventListener(
        "click",
        () => {

          state.currentCategory =
            category.id;

          renderCategories();

          renderChannels();

        }
      );

      elements.categoryNav
        .appendChild(button);

    }
  );

}


function getFilteredChannels() {

  let results =
    [...state.channels];


  if (
    state.currentCategory !==
    "all"
  ) {

    results =
      results.filter(
        channel =>
          channel.category ===
          state.currentCategory
      );

  }


  if (state.searchTerm) {

    results =
      results.filter(
        channel => {

          const name =
            String(
              channel.name || ""
            ).toLowerCase();

          const country =
            String(
              channel.country || ""
            ).toLowerCase();

          const description =
            String(
              channel.description || ""
            ).toLowerCase();

          return (
            name.includes(
              state.searchTerm
            ) ||
            country.includes(
              state.searchTerm
            ) ||
            description.includes(
              state.searchTerm
            )
          );

        }
      );

  }


  return results;

}


function renderChannels() {

  const channels =
    getFilteredChannels();


  elements.channelGrid.innerHTML =
    "";


  elements.channelCount.textContent =
    `${channels.length} channel${
      channels.length === 1
        ? ""
        : "s"
    }`;


  if (
    state.currentCategory ===
    "all"
  ) {

    elements.categoryTitle
      .textContent =
      "Featured Channels";

  } else {

    const category =
      state.categories.find(
        item =>
          item.id ===
          state.currentCategory
      );

    elements.categoryTitle
      .textContent =
      category
        ? category.name
        : "Channels";

  }


  if (channels.length === 0) {

    elements.channelGrid.innerHTML = `
      <div class="empty-state">
        No channels found.
      </div>
    `;

    return;

  }


  channels.forEach(
    channel => {

      const card =
        document.createElement(
          "button"
        );

      card.className =
        "channel-card";

      card.type = "button";

      card.tabIndex = 0;

      if (
        state.currentChannel &&
        state.currentChannel.id ===
        channel.id
      ) {

        card.classList.add(
          "active"
        );

      }


      const logo =
        channel.logo ||
        "assets/logo.svg";


      card.innerHTML = `

        <img
          class="channel-logo"
          src="${escapeHTML(logo)}"
          alt=""
          loading="lazy"
        >

        <div class="channel-info">

          <span class="channel-name">
            ${escapeHTML(channel.name)}
          </span>

          <div class="channel-meta">

            <span>
              ${escapeHTML(
                channel.country || ""
              )}
            </span>

            <span>
              ${channel.live ? "● LIVE" : ""}
            </span>

          </div>

        </div>

      `;


      card.addEventListener(
        "click",
        () => playChannel(channel)
      );


      elements.channelGrid
        .appendChild(card);

    }
  );

}


async function playChannel(channel) {

  if (!channel || !channel.stream) {

    showToast(
      "This channel does not have a stream yet."
    );

    return;

  }


  state.currentChannel =
    channel;


  elements.currentChannelName
    .textContent =
    channel.name;


  elements.currentChannelDescription
    .textContent =
    channel.description ||
    `${channel.country || ""} ${channel.category || ""}`;


  elements.playerMessage
    .classList
    .remove("hidden");


  elements.playerMessage
    .textContent =
    `Loading ${channel.name}...`;


  elements.loading
    .classList
    .remove("hidden");


  elements.video.pause();


  elements.video.removeAttribute(
    "src"
  );


  /*
    Browser-native playback.

    For HLS streams, compatibility depends
    on the device/browser.
  */

  elements.video.src =
    channel.stream;


  elements.video.load();


  if (state.autoplay) {

    try {

      await elements.video.play();

    } catch (error) {

      console.log(
        "Autoplay blocked:",
        error
      );

      elements.playerMessage
        .textContent =
        "Press Play to start.";

    }

  }


  if (
    state.rememberChannel
  ) {

    localStorage.setItem(
      "worldtv_last_channel",
      channel.id
    );

  }


  renderChannels();

}


function restoreLastChannel() {

  if (
    !state.rememberChannel
  ) {

    return;

  }


  const savedId =
    localStorage.getItem(
      "worldtv_last_channel"
    );


  if (!savedId) {

    return;

  }


  const channel =
    state.channels.find(
      item =>
        String(item.id) ===
        String(savedId)
    );


  if (channel) {

    state.currentChannel =
      channel;

    elements.currentChannelName
      .textContent =
      channel.name;

    elements.currentChannelDescription
      .textContent =
      channel.description || "";

    renderChannels();

  }

}


function toggleSearch() {

  elements.searchPanel
    .classList
    .toggle("hidden");


  if (
    !elements.searchPanel
      .classList
      .contains("hidden")
  ) {

    elements.searchInput.focus();

  }

}


function clearSearch() {

  elements.searchInput.value = "";

  state.searchTerm = "";

  renderChannels();

  elements.searchInput.focus();

}


function openSettings() {

  elements.settingsModal
    .classList
    .remove("hidden");

}


function closeSettings() {

  elements.settingsModal
    .classList
    .add("hidden");

}


function fullscreenVideo() {

  if (
    elements.video.requestFullscreen
  ) {

    elements.video.requestFullscreen();

  } else if (
    elements.video.webkitEnterFullscreen
  ) {

    elements.video.webkitEnterFullscreen();

  }

}


function loadSettings() {

  const saved =
    localStorage.getItem(
      "worldtv_settings"
    );


  if (!saved) {

    elements.autoplaySetting.checked =
      true;

    elements.rememberSetting.checked =
      true;

    state.autoplay = true;

    state.rememberChannel = true;

    return;

  }


  try {

    const settings =
      JSON.parse(saved);


    state.autoplay =
      settings.autoplay !== false;

    state.rememberChannel =
      settings.remember !== false;


    elements.autoplaySetting.checked =
      state.autoplay;

    elements.rememberSetting.checked =
      state.rememberChannel;

  } catch {

    console.log(
      "Settings reset."
    );

  }

}


function saveSettings() {

  state.autoplay =
    elements.autoplaySetting.checked;

  state.rememberChannel =
    elements.rememberSetting.checked;


  localStorage.setItem(
    "worldtv_settings",
    JSON.stringify({
      autoplay:
        state.autoplay,

      remember:
        state.rememberChannel
    })
  );


  showToast(
    "Settings saved."
  );

}


function showToast(message) {

  elements.toast.textContent =
    message;

  elements.toast.classList.add(
    "show"
  );


  clearTimeout(
    showToast.timer
  );


  showToast.timer =
    setTimeout(
      () => {

        elements.toast
          .classList
          .remove("show");

      },
      2500
    );

}


function handleKeyboard(event) {

  const tag =
    event.target.tagName
      .toLowerCase();


  if (
    tag === "input" ||
    tag === "textarea"
  ) {

    return;

  }


  switch (event.key) {

    case "f":
    case "F":

      fullscreenVideo();

      break;


    case "m":
    case "M":

      elements.video.muted =
        !elements.video.muted;

      break;


    case " ":

      event.preventDefault();

      if (
        elements.video.paused
      ) {

        elements.video.play();

      } else {

        elements.video.pause();

      }

      break;


    case "ArrowRight":

      elements.video.currentTime += 10;

      break;


    case "ArrowLeft":

      elements.video.currentTime -= 10;

      break;


    case "ArrowUp":

      elements.video.volume =
        Math.min(
          1,
          elements.video.volume + 0.1
        );

      break;


    case "ArrowDown":

      elements.video.volume =
        Math.max(
          0,
          elements.video.volume - 0.1
        );

      break;

  }

}


function escapeHTML(value) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}
