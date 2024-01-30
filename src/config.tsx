import { HSLAToRGBA } from "./utils/utils";
// @ts-ignore
import colors from "./colors.module.css";

interface Dictionary<T> {
  [Key: string]: T;
}

type MapElement = {
  name: string;
  color: Array<number>;
  type: string;
  checked: boolean;
};

export const mapElements: Dictionary<MapElement> = {
  Sverige: {
    name: "00_sverige",
    color: HSLAToRGBA(colors.ground),
    type: "ground",
    checked: true,
  },
  "Anlagt vatten": {
    name: "01_anlagt_vatten",
    color: HSLAToRGBA(colors.water),
    type: "ground",
    checked: true,
  },
  Vattendragsyta: {
    name: "02_vattendragsyta",
    color: HSLAToRGBA(colors.water),
    type: "ground",
    checked: true,
  },
  Sjö: {
    name: "03_sjo",
    color: HSLAToRGBA(colors.water),
    type: "ground",
    checked: true,
  },
  Glaciär: {
    name: "04_glaciar",
    color: HSLAToRGBA(colors["glacier"]),
    type: "ground",
    checked: true,
  },
  Kalfjäll: {
    name: "05_kalfjall",
    color: HSLAToRGBA(colors["open-mountain"]),
    type: "ground",
    checked: true,
  },
  Fjällbjörkskog: {
    name: "06_fjallbjorkskog",
    color: HSLAToRGBA(colors["mountain-birch"]),
    type: "ground",
    checked: true,
  },
  Lövskog: {
    name: "08_lovskog",
    color: HSLAToRGBA(colors["leaf-fores"]),
    type: "ground",
    checked: true,
  },
  Åker: {
    name: "09_aker",
    color: HSLAToRGBA(colors["field"]),
    type: "ground",
    checked: true,
  },
  Fruktodling: {
    name: "10_fruktodling",
    color: HSLAToRGBA(colors["fruit-farm"]),
    type: "ground",
    checked: true,
  },
  "Öppen mark": {
    name: "11_oppen_mark",
    color: HSLAToRGBA(colors["open-ground"]),
    type: "ground",
    checked: true,
  },
  "Hög bebyggelse": {
    name: "12_hog_bebygelse",
    color: HSLAToRGBA(colors["city-dense"]),
    type: "ground",
    checked: true,
  },
  "Låg bebyggelse": {
    name: "13_lag_bebygelse",
    color: HSLAToRGBA(colors["city-sparse"]),
    type: "ground",
    checked: true,
  },
  "Sluten bebyggelse": {
    name: "14_sluten_bebygelse",
    color: HSLAToRGBA(colors["city-closed"]),
    type: "ground",
    checked: true,
  },
  "Industri- och handelsbebyggelse": {
    name: "15_industri_handel",
    color: HSLAToRGBA(colors["city-industry"]),
    type: "ground",
    checked: true,
  },

  Motorväg: {
    name: "01_motorvag",
    color: HSLAToRGBA(colors["motorway"]),
    type: "communication",
    checked: true,
  },
  Motortrafikled: {
    name: "02_motortrafikled",
    color: HSLAToRGBA(colors["motor-trafic-route"]),
    type: "communication",
    checked: true,
  },
  "Mötesfri väg": {
    name: "03_motesfri_vag",
    color: HSLAToRGBA(colors["overall-link"]),
    type: "communication",
    checked: true,
  },
  Landsväg: {
    name: "04_landsvag",
    color: HSLAToRGBA(colors["country-road"]),
    type: "communication",
    checked: true,
  },
  "Landsväg liten": {
    name: "05_landsvag_liten",
    color: HSLAToRGBA(colors["country-road-small"]),
    type: "communication",
    checked: true,
  },
  Småväg: {
    name: "06_smavag",
    color: HSLAToRGBA(colors["main-street"]),
    type: "communication",
    checked: true,
  },
  "Småväg enkel standard": {
    name: "07_smavag_enkel_standard",
    color: HSLAToRGBA(colors["local-street-large"]),
    type: "communication",
    checked: true,
  },
  "Övergripande länk": {
    name: "08_overgripande_lank",
    color: HSLAToRGBA(colors["local-street-small"]),
    type: "communication",
    checked: true,
  },
  Huvudgata: {
    name: "09_huvudgata",
    color: HSLAToRGBA(colors["meeting-free-road"]),
    type: "communication",
    checked: true,
  },
  "Lokalgata stor": {
    name: "10_lokalgata_stor",
    color: HSLAToRGBA(colors["small-road"]),
    type: "communication",
    checked: true,
  },
  "Lokalgata liten": {
    name: "11_lokalgata_liten",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
  },

  Bostad: {
    name: "01_bostad",
    color: HSLAToRGBA(colors["residence-building"]),
    type: "construction",
    checked: true,
  },
  Industri: {
    name: "02_industri",
    color: HSLAToRGBA(colors["economy-building"]),
    type: "construction",
    checked: true,
  },
  Samhällsfunktion: {
    name: "03_samhallsfunktion",
    color: HSLAToRGBA(colors["complement-building"]),
    type: "construction",
    checked: true,
  },
  Verksamhet: {
    name: "04_verksamhet",
    color: HSLAToRGBA(colors["community-building"]),
    type: "construction",
    checked: true,
  },
  Ekonomibyggnad: {
    name: "05_ekonomibyggnad",
    color: HSLAToRGBA(colors["economy-building"]),
    type: "construction",
    checked: true,
  },
  Komplementbyggnad: {
    name: "06_komplementbyggnad",
    color: HSLAToRGBA(colors["operation-building"]),
    type: "construction",
    checked: true,
  },
  "Övrig byggnad": {
    name: "07_ovrig",
    color: HSLAToRGBA(colors["other-building"]),
    type: "construction",
    checked: true,
  },
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
