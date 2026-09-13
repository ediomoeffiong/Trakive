/**
 * @file locationData.js
 * @description Location datasets for dynamic cascading Country -> State -> City dropdowns in Trakive.
 * Country defaults to Nigeria.
 */

export const DEFAULT_COUNTRY = 'Nigeria';
export const DEFAULT_STATE = 'Lagos';
export const DEFAULT_CITY = 'Lekki';

export const COUNTRIES = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'United Kingdom',
  'United States',
  'Canada',
  'Germany',
  'France',
  'India',
  'Australia',
  'Brazil',
  'United Arab Emirates',
  'Other',
];

export const GENDERS = ['Male', 'Female'];

export const STATES_BY_COUNTRY = {
  Nigeria: [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
    'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
    'Yobe', 'Zamfara'
  ],
  Ghana: [
    'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Northern', 'Volta', 'Upper East', 'Upper West'
  ],
  Kenya: [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Uasin Gishu', 'Machakos', 'Kajiado'
  ],
  'South Africa': [
    'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West'
  ],
  'United States': [
    'California', 'New York', 'Texas', 'Florida', 'Illinois', 'Washington', 'Georgia', 'Massachusetts', 'Pennsylvania', 'Ohio'
  ],
  'United Kingdom': [
    'England', 'Scotland', 'Wales', 'Northern Ireland'
  ],
  Canada: [
    'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Nova Scotia', 'Manitoba', 'Saskatchewan'
  ],
  Germany: [
    'Bavaria', 'Berlin', 'North Rhine-Westphalia', 'Baden-Württemberg', 'Hesse', 'Hamburg', 'Saxony'
  ],
  France: [
    'Île-de-France', 'Auvergne-Rhône-Alpes', "Provence-Alpes-Côte d'Azur", 'Occitanie', 'Nouvelle-Aquitaine'
  ],
  India: [
    'Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Gujarat', 'West Bengal'
  ],
  Australia: [
    'New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania'
  ],
  Brazil: [
    'São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Paraná', 'Rio Grande do Sul'
  ],
  'United Arab Emirates': [
    'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
  ],
  Other: ['Main Region', 'Central District', 'Capital Territory', 'Other Province']
};

export const CITIES_BY_STATE = {
  // Nigeria Cities
  Lagos: [
    'Lekki', 'Ikeja', 'Victoria Island', 'Yaba', 'Surulere', 'Ikorodu', 'Epe', 'Ajah',
    'Badagry', 'Festac', 'Maryland', 'Oshodi', 'Agege', 'Alimosho', 'Ikoyi', 'Gbagada'
  ],
  'FCT (Abuja)': [
    'Garki', 'Wuse', 'Maitama', 'Asokoro', 'Utako', 'Jabi', 'Gwarinpa', 'Kubwa', 'Lugbe', 'Central Business District', 'Kuje', 'Bwari'
  ],
  Rivers: [
    'Port Harcourt', 'Obio-Akpor', 'Eleme', 'Bonny', 'Oyigbo', 'Degema', 'Okrika', 'Ahoada'
  ],
  Oyo: [
    'Ibadan North', 'Ibadan Southwest', 'Ogbomoso', 'Oyo', 'Iseyin', 'Bodija', 'Dugbe', 'Ring Road'
  ],
  'Akwa Ibom': [
    'Uyo', 'Eket', 'Ikot Ekpene', 'Oron', 'Ibeno', 'Abak', 'Etinan'
  ],
  Enugu: [
    'Enugu North', 'Enugu South', 'Nsukka', 'Udi', 'Independence Layout', 'Abakpa', 'New Haven'
  ],
  Kano: [
    'Kano Municipal', 'Dala', 'Fagge', 'Gwale', 'Nassarawa', 'Tarauni'
  ],
  Ogun: [
    'Abeokuta', 'Ota', 'Ijebu Ode', 'Sagamu', 'Ilaro'
  ],
  Anambra: [
    'Awka', 'Onitsha', 'Nnewi', 'Ekwulobia'
  ],
  Edo: [
    'Benin City', 'Uromi', 'Ekpoma', 'Auchi'
  ],
  Delta: [
    'Warri', 'Asaba', 'Ughelli', 'Sapele', 'Agbor'
  ],
  Kaduna: [
    'Kaduna North', 'Kaduna South', 'Zaria', 'Kafanchan'
  ],
  Abia: ['Aba', 'Umuahia', 'Ohafia'],
  Adamawa: ['Yola', 'Mubi', 'Jimeta'],
  Bauchi: ['Bauchi', 'Azare', 'Misau'],
  Bayelsa: ['Yenagoa', 'Ogbia', 'Brass'],
  Benue: ['Makurdi', 'Gboko', 'Otukpo'],
  Borno: ['Maiduguri', 'Jere', 'Bama'],
  'Cross River': ['Calabar', 'Ikom', 'Ogoja'],
  Ebonyi: ['Abakaliki', 'Afikpo', 'Onueke'],
  Ekiti: ['Ado Ekiti', 'Ikole', 'Ijero'],
  Gombe: ['Gombe', 'Dukku', 'Kaltungo'],
  Imo: ['Owerri', 'Orlu', 'Okigwe'],
  Jigawa: ['Dutse', 'Hadejia', 'Gumel'],
  Katsina: ['Katsina', 'Daura', 'Funtua'],
  Kebbi: ['Birnin Kebbi', 'Argungu', 'Yauri'],
  Kogi: ['Lokoja', 'Okene', 'Kabba'],
  Kwara: ['Ilorin', 'Offa', 'Omu-Aran'],
  Nasarawa: ['Lafia', 'Keffi', 'Karu'],
  Niger: ['Minna', 'Bida', 'Suleja'],
  Ondo: ['Akure', 'Ondo Town', 'Owo'],
  Plateau: ['Jos North', 'Jos South', 'Bukuru'],
  Sokoto: ['Sokoto', 'Tambuwal', 'Wamako'],
  Taraba: ['Jalingo', 'Wukari', 'Bali'],
  Yobe: ['Damaturu', 'Gashua', 'Potiskum'],
  Zamfara: ['Gusau', 'Kaura Namoda', 'Talata Mafara'],

  // Ghana Cities
  'Greater Accra': ['Accra', 'Tema', 'Madina', 'East Legon'],
  Ashanti: ['Kumasi', 'Obuasi', 'Ejisu'],

  // Kenya Cities
  Nairobi: ['Nairobi Central', 'Westlands', 'Kilimani', 'Karen'],
  Mombasa: ['Mombasa Island', 'Nyali', 'Bamburi'],

  // US Cities
  California: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento'],
  'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany'],
  Texas: ['Houston', 'Austin', 'Dallas', 'San Antonio'],

  // UK Cities
  England: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Bristol'],
  Scotland: ['Edinburgh', 'Glasgow', 'Aberdeen'],

  // Canada Cities
  Ontario: ['Toronto', 'Ottawa', 'Hamilton', 'London'],
  Quebec: ['Montreal', 'Quebec City'],
  'British Columbia': ['Vancouver', 'Victoria', 'Surrey'],

  // Other Fallback
  default: ['Central City', 'Downtown', 'Metropolis Area', 'North District', 'South District']
};

/**
 * Get available states for a country.
 */
export const getStatesForCountry = (country = DEFAULT_COUNTRY) => {
  return STATES_BY_COUNTRY[country] || STATES_BY_COUNTRY.Nigeria;
};

/**
 * Get available cities for a state and country.
 */
export const getCitiesForState = (state = '', country = DEFAULT_COUNTRY) => {
  if (CITIES_BY_STATE[state]) {
    return CITIES_BY_STATE[state];
  }
  // Fallback state mapping
  const states = getStatesForCountry(country);
  if (states.length > 0) {
    const firstState = states[0];
    if (CITIES_BY_STATE[firstState]) return CITIES_BY_STATE[firstState];
  }
  return CITIES_BY_STATE.default;
};
