// represents number as a string;
type StringNumber = string;

// "-119.755992 34.406958"
type GMLPoint = string;

type AddressComponent = {
  type: string;
  name: string;
};

type GeocoderPrecision =
  | 'exact'
  | 'number'
  | 'near'
  | 'range'
  | 'street'
  | 'other';

type GeocoderMetaDataKind =
  | 'house' // отдельный дом
  | 'street' // улица
  | 'metro' // станция метро
  | 'district' // район города
  | 'locality' // населённый пункт: город / поселок / деревня / село и т. п.
  | 'area' // район области
  | 'province' // область
  | 'country' // страна
  | 'region' // устаревший тип, не используется
  | 'hydro' // река / озеро / ручей / водохранилище и т. п.
  | 'railway_station' // ж.д. станция	Россия, Москва, Курский вокзал
  | 'station' // станции, не относящиеся к железной дороге. Например, канатные станции.	Россия, Москва, Московская
  | 'route' // линия метро / шоссе / ж.д. линия	Россия, Центральный федеральный округ, Ярославское направление
  | 'vegetation' // лес / парк / сад и т. п.
  | 'airport' // аэропорт
  | 'entrance' // подъезд / вход	Россия, Москва, улица Льва Толстого, 16, подъезд 5
  | 'other';

type GeocoderMetaData = {
  kind: GeocoderMetaDataKind;
  text: string;
  precision: GeocoderPrecision;
  Address: {
    country_code: string;
    postal_code: string;
    formatted: string;
    Components: AddressComponent[];
  };

  // deprecated field
  AddressDetails: unknown;
};

type GeoObject = {
  metaDataProperty: {
    GeocoderMetaData: GeocoderMetaData;
  };
  description: string; // "Москва, Россия"
  name: string; //"улица Новый Арбат, 24"
  boundedBy: {
    Envelope: {
      lowerCorner: GMLPoint; // "37.583508 55.750768"
      upperCorner: GMLPoint; // "37.591719 55.755398"
    };
  };
  Point: {
    pos: GMLPoint; // "37.587614 55.753083"
  };
};

export type GeocoderResponse = {
  response: {
    GeoObjectCollection: {
      metaDataProperty: {
        GeocoderResponseMetaData: {
          request: string;
          found: StringNumber;
          results: StringNumber;
        };
      };
      featureMember: { GeoObject: GeoObject }[];
    };
  };
};

export type LatLon = [number, number];
