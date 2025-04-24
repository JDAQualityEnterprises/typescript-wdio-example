export default class User {
  name: string;
  address: string;
  city: string;
  telephone: string;
  email: string;

  constructor(name?: string, address?: string, city?: string, telephone?: string, email?: string) {
    this.name = name;
    this.address = address;
    this.city = city;
    this.telephone = telephone;
    this.email = email;
  }
}
