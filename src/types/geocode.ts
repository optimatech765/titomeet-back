export interface FeatureCollection {
  type: 'FeatureCollection';
  features: Feature[];
  query: Query;
}

interface Feature {
  type: 'Feature';
  properties: Properties;
  geometry: Geometry;
  bbox: number[];
}

interface Properties {
  country: string;
  country_code: string;
  region?: string;
  state: string;
  city: string;
  postcode?: string;
  datasource: Datasource;
  lon: number;
  lat: number;
  population: number;
  result_type: ResultType;
  formatted: string;
  address_line1: string;
  address_line2: string;
  category: string;
  timezone: Timezone;
  plus_code: string;
  plus_code_short: string;
  rank: Rank;
  place_id: string;
  state_code?: string;
  county?: string;
}

interface Datasource {
  sourcename: string;
  attribution: string;
  license: string;
  url: string;
}

interface Timezone {
  name: string;
  offset_STD: string;
  offset_STD_seconds: number;
  offset_DST: string;
  offset_DST_seconds: number;
  abbreviation_STD: string;
  abbreviation_DST: string;
}

interface Rank {
  confidence: number;
  confidence_city_level: number;
  match_type: string;
}

interface Geometry {
  type: 'Point';
  coordinates: number[];
}

interface Query {
  text: string;
  parsed: ParsedQuery;
}

interface ParsedQuery {
  city: string;
  expected_type: string;
}

export interface PlaceSuggestion {
  line1: string;
  line2?: string;
  city: string;
  country: string;
  state: string;
  postalCode?: string;
  //countryCode?: string;
  resultType?: ResultType;
  lon: number;
  lat: number;
}

export type ResultType =
  | 'city'
  | 'district'
  | 'suburb'
  | 'neighborhood'
  | 'county'
  | 'state'
  | 'country';
