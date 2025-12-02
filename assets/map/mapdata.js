var simplemaps_countrymap_mapdata={
  main_settings: {
   //General settings
    width: "responsive", //'700' or 'responsive'
    background_color: "#FFFFFF",
    background_transparent: "yes",
    border_color: "#ffffff",
    
    //State defaults
    state_description: "",
    state_color: "#88A4BC",
    state_hover_color: "#3B729F",
    state_url: "",
    border_size: 1.5,
    all_states_inactive: "no",
    all_states_zoomable: "yes",
    
    //Location defaults
    location_description: "Location description",
    location_url: "",
    location_color: "#FF0067",
    location_opacity: 0.8,
    location_hover_opacity: 1,
    location_size: 25,
    location_type: "square",
    location_image_source: "/assets/img/icon/location.svg",
    location_border_color: "#FFFFFF",
    location_border: 2,
    location_hover_border: 2.5,
    all_locations_inactive: "no",
    all_locations_hidden: "no",
    
    //Label defaults
    label_color: "#ffffff",
    label_hover_color: "#ffffff",

    label_size: 16,
    label_font: "Arial",
    label_display: "auto",
    label_scale: "yes",
    hide_labels: "no",
    hide_eastern_labels: "no",
   
    //Zoom settings
    zoom: "no",
    manual_zoom: "yes",
    back_image: "no",
    initial_back: "no",
    initial_zoom: "-1",
    initial_zoom_solo: "no",
    region_opacity: 1,
    region_hover_opacity: 0.6,
    zoom_out_incrementally: "yes",
    zoom_percentage: 0.99,
    zoom_time: 0.5,
    
    //Popup settings
    popup_color: "white",
    popup_opacity: 0.9,
    popup_shadow: 1,
    popup_corners: 5,
    popup_font: "12px/1.5 Verdana, Arial, Helvetica, sans-serif",
    popup_nocss: "no",
    
    //Advanced settings
    div: "map",
    auto_load: "yes",
    url_new_tab: "yes",
    images_directory: "default",
    fade_time: 0.1,
    link_text: "View Website",
    popups: "detect",
    state_image_url: "",
    state_image_position: "",
    location_image_url: ""
  },
  state_specific: {
    PKBA: {
      name: "Baluchistan",
      color: "#b8c096"
    },
    PKGB: {
      name: "Northern Areas",
      color: "#a4de79"
    },
    PKIS: {
      name: "F.C.T."
    },
    PKJK: {
      name: "Azad Kashmir",
      color: "#52a685"
    },
    PKKP: {
      name: "K.P.K",
      color: "#98179e"
    },
    PKPB: {
      name: "Punjab",
      color: "#4f9e17"
    },
    PKSD: {
      name: "Sindh",
      color: "#a6526c"
    }
  },
  locations: {
    "0": {
      name: "Islamabad",
      lat: "33.69",
      lng: "73.0551",
      color: "#e20000",
      description: "Islamabad Chapter",
      url: "/chapters/detail.html?id=9",
      type: "circle"
    },
    "1": {
      lat: "24.86",
      lng: "66.99",
      color: "blue",
      name: "Karachi",
      description: "Karachi Chapter",
      url: "/chapters/detail.html?id=12",
      type: "circle"
    },
    "2": {
      lat: "30.181459",
      lng: "71.492157",
      color: "blue",
      name: "Multan",
      description: "Multan Chapter",
      url: "/chapters/detail.html?id=5",
      type: "circle"
    },
    "3": {
      lat: "30.183270",
      lng: "66.996452",
      color: "blue",
      name: "Quetta",
      description: "Quetta Chapter",
      url: "/chapters/detail.html?id=13",
      type: "circle"
    },
    "4": {
      lat: "32.571144",
      lng: "74.075005",
      color: "blue",
      name: "Gujranwala",
      description: "Gujranwala/Sialkot Chapter",
      url: "/chapters/detail.html?id=2",
      type: "circle"
    },
    "5": {
      lat: "32.082466",
      lng: "72.669128",
      color: "blue",
      name: "Sargodha",
      description: "Sargodha Chapter",
      url: "/chapters/detail.html?id=4",
      type: "circle"
    },
    "6": {
      lat: "31.418715",
      lng: "73.079109",
      color: "blue",
      name: "Faisalabad",
      description: "Faisalabad Chapter",
      url: "/chapters/detail.html?id=3",
      type: "circle"
    },
    "7": {
      lat: "35.920834",
      lng: "74.308334",
      name: "Gilgit",
      color: "blue",
      description: "Gilgit Chapter",
      url: "/chapters/detail.html?id=14",
      type: "circle"
    },
    "8": {
      lat: "34.025917",
      lng: "71.560135",
      name: "Peshawar",
      color: "#e20000",
      description: "KPK Chapter",
      url: "/chapters/detail.html?id=10",
      type: "circle"
    },
    "9": {
      lat: "29.418068",
      lng: "71.670685",
      name: "Bahawalpur",
      color: "blue",
      description: "Bahawalpur Chapter",
      url: "/chapters/detail.html?id=6",
      type: "circle"
    },
   "10": {
    lat: "31.582045",
    lng: "74.329376",
    name: "Lahore",
    color: "#e20000",
    description: "Lahore Chapter",
    url: "/chapters/detail.html?id=1",
    type: "circle"
   },
   "11": {
    lat: "30.677717",
    lng: "73.106812",
    name: "Sahiwal",
    color: "blue",
    description: "Sahiwal Chapter",
    url: "/chapters/detail.html?id=7",
    type: "circle"
   },

    "12": {
      lat: "33.148392",
      lng: "73.751770",
      name: "Azad Kashmir",
      color: "blue",
      description: "Azad Kashmir Chapter",
      url: "/chapters/detail.html?id=11",
      type: "circle"
    },
    "13": {
      lat: "30.032486",
      lng: "70.640244",
      name: "Dera Ghazi Khan",
      color: "blue",
      description: "Dera Ghazi Khan Chapter",
      url: "/chapters/detail.html?id=8",
      type: "circle"
    }
  },
  labels: {
    PKBA: {
      name: "Baluchistan",
      parent_id: "PKBA"
    },
    PKGB: {
      name: "Northern Areas",
      parent_id: "PKGB"
    },
    PKIS: {
      name: "F.C.T.",
      parent_id: "PKIS"
    },
    PKJK: {
      name: "Azad Kashmir",
      parent_id: "PKJK"
    },
    PKKP: {
      name: "K.P.",
      parent_id: "PKKP"
    },
    PKPB: {
      name: "Punjab",
      parent_id: "PKPB"
    },
    PKSD: {
      name: "Sind",
      parent_id: "PKSD"
    }
  },
  legend: {
    entries: []
  },
  regions: {}
};