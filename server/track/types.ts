type TrackingEvent = {
  id: unknown;
  eventDateTime: string; // "14.01.2020 23:03:11"
  operationDateTime: string; // "14.01.2020 23:03:11"
  operationAttribute: string; // "Трек-код внесен в базу Track24 для автоматического мониторинга."
  operationType: string; // "Вероятно, посылка еще не отправлена."
  operationPlacePostalCode: string; // ""
  operationPlaceName: string; // ""
  itemWeight: 0;
  source: string; // "track24"
  serviceName: string; // "Track24.ru"
  operationAttributeInformation: string; // ""
  operationAttributeOriginal: string; // "Трек-код внесен в базу Track24.ru для автоматического мониторинга."
  operationTypeOriginal: string; // "Вероятно, посылка еще не отправлена."
  operationPlaceNameOriginal: string; // ""
};

type LastPoint = {
  id: string; // "2714245291"
  eventDateTime: string; // "17.04.2020 15:53:01"
  operationDateTime: string; // "15.04.2020 14:19:00"
  operation?: string; // "Прием"
  operationAttribute: string; // "Прием"
  operationType: string; // ""
  operationPlacePostalCode?: string; // ""
  operationPlaceName?: string; // "Гонконг AMC"
  itemWeight?: string; // "0"
  source: string; // "rupost"
  serviceName: string; // "Почта России"
  operationAttributeInformation?: string;
};

export type TrackResponse =
  | { status: "error"; message: string }
  | {
      status: "ok";
      data: {
        trackCreationDateTime: string; //"14.01.2020 23:03:11"
        trackUpdateDateTime: string; //"18.04.2020 18:20:54"
        trackUpdateDiffMinutes: 29;
        trackDeliveredDateTime: string; //""
        fromCountryCode: string; //"SG"
        fromCountry: string; //"Singapore"
        fromName: string; //""
        destinationName: string; //""
        destinationCountryCode: string; //""
        destinationCountry: string; //""
        destinationPostalCode: string; //""
        fromCity: string; //""
        destinationCity: string; //""
        fromAddress: string; //""
        destinationAddress: string; //""
        collectOnDeliveryPrice: string; //""
        declaredValue: string; //""
        deliveredStatus: "0" | "1"; //"0"
        trackCodeModified: string; //""
        awaiting: boolean;
        events: TrackingEvent[];
        itemWeight: number; // 0
        trackFirstOperationDateTime: string; // "14.01.2020 23:03:11"
        daysInTransit: number; // 95
        daysTracking: number; // 95
        groupedCompanyNames: string[];
        groupedEvents: unknown[]; // only for extended subscribtion
        lastPoint: LastPoint;
      };
      services: string[]; // "UPU", "SGPOST", "CLVLNKS", "EXP4PX", "CAINIAO", "DHLGR", "PANASIA", "FLYT", "WISH"
      deliveredStat: {
        minDeliveryDays: string; // "26"
        averageDeliveryDays: string; // "44"
        maxDeliveryDays: string; // "74"
        type: string; // "Регистрируемое почтовое отправление"
      };
      id: string; // "12da042f3c65d4d7a16afcbe8bc12e4e"
      rpm: number; // 0
      totalTime: number; // 0.1021
    };
