/// <reference types="cypress" />
const axios = require('axios').default;

context('Aliasing', () => {
  beforeEach(() => {
  })

  it('Criar usuario valido', async () => {
    const url = 'https://gorest.co.in/public-api/users';
    const userData = {
      "name": "Danilo Teste",
      "email": "danilo46@gmail.com",
      "gender": "Male",
      "status": "Active"
  };
  const accessToken = '2275e2cbbf8dc1d113b25fb018cdb2e07e088b35bb5f7b7c13ca160ed96a82ba';

  const response =  await axios.post(url, userData, {headers: { 'Authorization': `Bearer ${accessToken}` }});
  const data = response.data;

  expect(response.status).to.equal(200);

  expect(data.code).to.equal(201);

  const userId = data.data.id;

  expect(userId > 0).to.be.true;

  cy.log(' Usuario ',response.data.data);
  cy.debug();
  })
})
