export const ground: { [index: string]: string } = {
  "Granskog/Mark": "00_sverige",
  "Anlagt vatten": "01_anlagt_vatten",
  Vattendragsyta: "02_vattendragsyta",
  Sjö: "03_sjo",
  Glaciär: "04_glaciar",
  Kalfjäll: "05_kalfjall",
  Fjällbjörkskog: "06_fjallbjorkskog",
  Lövskog: "08_lovskog",
  Åker: "09_aker",
  Fruktodling: "10_fruktodling",
  "Öppen mark": "11_oppen_mark",
  "Hög bebyggelse": "12_hog_bebygelse",
  "Låg bebyggelse": "13_lag_bebygelse",
  "Sluten bebyggelse": "14_sluten_bebygelse",
  "Industri- och handelsbebyggelse": "15_industri_handel",
};

export const road: { [index: string]: string } = {
  Motorväg: "01_motorvag",
  Motortrafikled: "02_motortrafikled",
  "Mötesfri väg": "03_motesfri_vag",
  Landsväg: "04_landsvag",
  "Landsväg liten": "05_landsvag_liten",
  Småväg: "06_smavag",
  "Småväg enkel standard": "07_smavag_enkel_standard",
  "Övergripande länk": "08_overgripande_lank",
  Huvudgata: "09_huvudgata",
  "Lokalgata stor": "10_lokalgata_stor",
  "Lokalgata liten": "11_lokalgata_liten",
  Parkväg: "01_parkvag",
  Cykelväg: "02_cykelvag",
  Gångstig: "03_gangstig",
  Elljusspår: "04_elljusspar",
  Traktorväg: "05_traktorvag",
  Vandringsled: "06_vandringsled",
  "Vandrings- och vinterled": "07_vandrings_vinterled",
  Vinterled: "08_vinterled",
  "Lämplig färdväg": "01_lamplig_fardvag",
  Rennäringsled: "02_rennaringsled",
  "Fångstarm till led": "03_fangstarm_till_led",
  Roddled: "04_roddled",
  "Svårorienterad gångstig": "05_svarorienterad_gangstig",
  Skidspår: "06_skidspar",
  Båtdrag: "07_batdrag",
  "Trafikerad båtled": "08_trafikerad_batled",
  Järnväg: "01_jarnvag",
  Museijärnväg: "02_museijarnvag",
};

export const construction: { [index: string]: string } = {
  Bostad: "01_bostad",
  Industri: "02_industri",
  Samhällsfunktion: "03_samhallsfunktion",
  Verksamhet: "04_verksamhet",
  Ekonomibyggnad: "05_ekonomibyggnad",
  Komplementbyggnad: "06_komplementbyggnad",
  "Övrig byggnad": "07_ovrig",
};

export const STROKED: { [index: string]: number } = {
  Sverige: 1,

  "Anlagt vatten": 1,
  Vattendragsyta: 1,
  Sjö: 1,

  "Hög bebyggelse": 0,
  "Låg bebyggelse": 0,
  "Sluten bebyggelse": 0,
  "Industri- och handelsbebyggelse": 0,

  "Öppen mark": 0,
  "Barr- och blandskog": 0,
  Lövskog: 0,

  Fruktodling: 0,
  Åker: 0,

  Fjällbjörkskog: 0,
  Glaciär: 0,
  Kalfjäll: 0,
};

export const COLOR: { [index: string]: Array<number> } = {
  Sverige: [160, 210, 180],

  "Anlagt vatten": [222, 244, 252],
  Vattendragsyta: [222, 244, 252],
  Sjö: [222, 244, 252],

  "Hög bebyggelse": [210, 210, 210],
  "Låg bebyggelse": [220, 220, 220],
  "Sluten bebyggelse": [230, 230, 230],
  "Industri- och handelsbebyggelse": [240, 240, 240],

  "Öppen mark": [155, 118, 83, 50],
  "Barr- och blandskog": [110, 177, 131],
  Lövskog: [45, 90, 39, 50],

  Fruktodling: [199, 55, 47, 50],
  Åker: [245, 222, 179, 50],

  Fjällbjörkskog: [99, 126, 29, 50],
  Glaciär: [0, 134, 1450, 100],
  Kalfjäll: [125, 200, 181, 100],

  Bostad: [30, 30, 30, 200],
  Ekonomibyggnad: [30, 30, 30, 200],
  Industri: [30, 30, 30, 200],
  Komplementbyggnad: [30, 30, 30, 200],
  Samhällsfunktion: [30, 30, 30, 200],
  Verksamhet: [30, 30, 30, 200],
  "Övrig byggnad": [30, 30, 30, 200],

  Motorväg: [255, 255, 255, 200],
  Motortrafikled: [255, 255, 255, 200],
  "Övergripande länk": [255, 255, 255, 200],
  Landsväg: [255, 255, 255, 200],
  "Landsväg liten": [255, 255, 255, 200],
  Huvudgata: [255, 255, 255, 200],
  "Lokalgata stor": [255, 255, 255, 200],
  "Lokalgata liten": [255, 255, 255, 200],
  "Mötesfri väg": [255, 255, 255, 200],
  Småväg: [255, 255, 255, 200],
  "Småväg enkel standard": [255, 255, 255, 200],
};
