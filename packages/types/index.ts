export type SORN = string | number;

export interface Address {
  addressComponent: {
    citycode: string;
    adcode: string;
    businessAreas: string[];
    neighborhoodType: string;
    neighborhood: string;
    province: string;
    street: string;
    streetNumber: string;
    township: string;
  };
  crosses: string[];
  formattedAddress: string;
  pois: string[];
  roads: string[];
}
export interface CoordChangeProps {
  lng: SORN;
  lat: SORN;
  position: SORN[];
  address: Address;
  formattedAddress: string;
}
export interface CoordMapExpose {
  resetMap: (posClear?: boolean) => void;
  destroyMap: () => void;
}
declare global {
  interface Window {
    _AMapSecurityConfig: { securityJsCode: string };
  }
}
