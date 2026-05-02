import { faker } from '@faker-js/faker';

export interface SignupUser {
  firstName: string;
  lastName: string;
  phone: string;
  region: string;
  email: string;
  password: string;
}

const CANADIAN_AREA_CODES = [
  '514', '438', // Quebec (Montreal)
  '416', '647', '905', // Ontario (Toronto)
  '604', '778', // BC (Vancouver)
  '403', '587', // Alberta (Calgary)
  '613', '343', // Ontario (Ottawa)
];

const CANADIAN_PROVINCES = ['ON', 'QC', 'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'PE', 'SK'];

function generatePassword(): string {
  // Requirements: 12–31 chars, one uppercase, one lowercase, one number
  const lower  = faker.string.alpha({ length: 6, casing: 'lower' });
  const upper  = faker.string.alpha({ length: 2, casing: 'upper' });
  const digits = faker.string.numeric(2);
  const extra  = faker.string.alpha({ length: faker.number.int({ min: 2, max: 12 }), casing: 'lower' });
  return faker.helpers.shuffle([...lower, ...upper, ...digits, ...extra]).join('');
}

export function validUser(): SignupUser {
  return {
    firstName: faker.person.firstName(),
    lastName:  faker.person.lastName(),
    phone:     `${faker.helpers.arrayElement(CANADIAN_AREA_CODES)}${faker.string.numeric(7)}`,
    region:    faker.helpers.arrayElement(CANADIAN_PROVINCES),
    email:     `${faker.internet.username()}.${faker.string.uuid()}@mailinator.com`,
    password:  generatePassword(),
  };
}
