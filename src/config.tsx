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
  stroke: number;
};

export const mapElements: Dictionary<MapElement> = {
  Sverige: {
    name: "00_sverige",
    color: HSLAToRGBA(colors.ground),
    type: "ground",
    checked: true,
    stroke: 1,
  },
  "Anlagt vatten": {
    name: "01_anlagt_vatten",
    color: HSLAToRGBA(colors.water),
    type: "ground",
    checked: true,
    stroke: 1,
  },
  Vattendragsyta: {
    name: "02_vattendragsyta",
    color: HSLAToRGBA(colors.water),
    type: "ground",
    checked: true,
    stroke: 1,
  },
  Sjö: {
    name: "03_sjo",
    color: HSLAToRGBA(colors.water),
    type: "ground",
    checked: true,
    stroke: 1,
  },
  Glaciär: {
    name: "04_glaciar",
    color: HSLAToRGBA(colors["glacier"]),
    type: "ground",
    checked: true,
    stroke: 0,
  },
  Kalfjäll: {
    name: "05_kalfjall",
    color: HSLAToRGBA(colors["open-mountain"]),
    type: "ground",
    checked: true,
    stroke: 0,
  },
  Fjällbjörkskog: {
    name: "06_fjallbjorkskog",
    color: HSLAToRGBA(colors["mountain-birch"]),
    type: "ground",
    checked: true,
    stroke: 0,
  },
  Lövskog: {
    name: "08_lovskog",
    color: HSLAToRGBA(colors["leaf-fores"]),
    type: "ground",
    checked: true,
    stroke: 0,
  },
  Åker: {
    name: "09_aker",
    color: HSLAToRGBA(colors["field"]),
    type: "ground",
    checked: true,
    stroke: 0,
  },
  Fruktodling: {
    name: "10_fruktodling",
    color: HSLAToRGBA(colors["fruit-farm"]),
    type: "ground",
    checked: true,
    stroke: 0,
  },
  "Öppen mark": {
    name: "11_oppen_mark",
    color: HSLAToRGBA(colors["open-ground"]),
    type: "ground",
    checked: true,
    stroke: 0,
  },
  "Hög bebyggelse": {
    name: "12_hog_bebygelse",
    color: HSLAToRGBA(colors["city-dense"]),
    type: "ground",
    checked: true,
    stroke: 0,
  },
  "Låg bebyggelse": {
    name: "13_lag_bebygelse",
    color: HSLAToRGBA(colors["city-sparse"]),
    type: "ground",
    checked: true,
    stroke: 0,
  },
  "Sluten bebyggelse": {
    name: "14_sluten_bebygelse",
    color: HSLAToRGBA(colors["city-closed"]),
    type: "ground",
    checked: true,
    stroke: 0,
  },
  "Industri- och handelsbebyggelse": {
    name: "15_industri_handel",
    color: HSLAToRGBA(colors["city-industry"]),
    type: "ground",
    checked: true,
    stroke: 0,
  },
  Motorväg: {
    name: "01_motorvag",
    color: HSLAToRGBA(colors["motorway"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  Motortrafikled: {
    name: "02_motortrafikled",
    color: HSLAToRGBA(colors["motor-trafic-route"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  "Mötesfri väg": {
    name: "03_motesfri_vag",
    color: HSLAToRGBA(colors["overall-link"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  Landsväg: {
    name: "04_landsvag",
    color: HSLAToRGBA(colors["country-road"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  "Landsväg liten": {
    name: "05_landsvag_liten",
    color: HSLAToRGBA(colors["country-road-small"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  Småväg: {
    name: "06_smavag",
    color: HSLAToRGBA(colors["main-street"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  "Småväg enkel standard": {
    name: "07_smavag_enkel_standard",
    color: HSLAToRGBA(colors["local-street-large"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  "Övergripande länk": {
    name: "08_overgripande_lank",
    color: HSLAToRGBA(colors["local-street-small"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  Huvudgata: {
    name: "09_huvudgata",
    color: HSLAToRGBA(colors["meeting-free-road"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  "Lokalgata stor": {
    name: "10_lokalgata_stor",
    color: HSLAToRGBA(colors["small-road"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  "Lokalgata liten": {
    name: "11_lokalgata_liten",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  Parkväg: {
    name: "01_parkvag",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  Cykelväg: {
    name: "02_cykelvag",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  Gångstig: {
    name: "03_gangstig",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  Elljusspår: {
    name: "04_elljusspar",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  Traktorväg: {
    name: "05_traktorvag",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  Vandringsled: {
    name: "06_vandringsled",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  "Vandrings- och vinterled": {
    name: "07_vandrings_vinterled",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  Vinterled: {
    name: "08_vinterled",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  "Lämplig färdväg": {
    name: "01_lamplig_fardvag",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  Rennäringsled: {
    name: "02_rennaringsled",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  "Fångstarm till led": {
    name: "03_fangstarm_till_led",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  Roddled: {
    name: "04_roddled",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  "Svårorienterad gångstig": {
    name: "05_svarorienterad_gangstig",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },

  Skidspår: {
    name: "06_skidspar",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  Båtdrag: {
    name: "07_batdrag",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  "Trafikerad båtled": {
    name: "08_trafikerad_batled",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  Järnväg: {
    name: "01_jarnvag",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  Museijärnväg: {
    name: "02_museijarnvag",
    color: HSLAToRGBA(colors["small-road-simple"]),
    type: "communication",
    checked: true,
    stroke: 0,
  },
  Bostad: {
    name: "01_bostad",
    color: HSLAToRGBA(colors["residence-building"]),
    type: "construction",
    checked: true,
    stroke: 0,
  },
  Industri: {
    name: "02_industri",
    color: HSLAToRGBA(colors["economy-building"]),
    type: "construction",
    checked: true,
    stroke: 0,
  },
  Samhällsfunktion: {
    name: "03_samhallsfunktion",
    color: HSLAToRGBA(colors["complement-building"]),
    type: "construction",
    checked: true,
    stroke: 0,
  },
  Verksamhet: {
    name: "04_verksamhet",
    color: HSLAToRGBA(colors["community-building"]),
    type: "construction",
    checked: true,
    stroke: 0,
  },
  Ekonomibyggnad: {
    name: "05_ekonomibyggnad",
    color: HSLAToRGBA(colors["economy-building"]),
    type: "construction",
    checked: true,
    stroke: 0,
  },
  Komplementbyggnad: {
    name: "06_komplementbyggnad",
    color: HSLAToRGBA(colors["operation-building"]),
    type: "construction",
    checked: true,
    stroke: 0,
  },
  "Övrig byggnad": {
    name: "07_ovrig",
    color: HSLAToRGBA(colors["other-building"]),
    type: "construction",
    checked: true,
    stroke: 0,
  },
};
