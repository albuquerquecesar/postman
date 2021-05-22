/// <reference types="cypress" />
const axios = require('axios').default;
const faker = require('faker');

context('API', () => {

  const END_POINTS = {
    USERS: 'https://gorest.co.in/public-api/users',
  };
  const accessToken = '2275e2cbbf8dc1d113b25fb018cdb2e07e088b35bb5f7b7c13ca160ed96a82ba';
  const baseConfig = {headers: { 'Authorization': `Bearer ${accessToken}` }};
  
  beforeEach(async function() {
    const userData = {
      "name": `${faker.name.firstName()} ${faker.name.lastName()}`,
      "email": `${faker.datatype.number()}${faker.internet.email()}`,
      "gender": "Male",
      "status": "Active"
  };
    const response =  await axios.post(END_POINTS.USERS, userData, baseConfig);
    const user = response.data.data;

    this.targetUserId =  user.id;
  })

  it('Check created valid user', async function(){
    let targetUser;
    let pages = 1;
    let page = 1;
    const visitedPages = [];

    while(!targetUser && visitedPages.length < pages) {
      const response = await axios.get(`${END_POINTS.USERS}?page=${page}` , baseConfig);

      const users = response.data.data;
      const pagination = response.data.meta.pagination;
      const currentPage = page;

      pages = pagination.pages;
      targetUser = users.find( u => u.id === this.targetUserId);

      page = pages - visitedPages.length;
      visitedPages.push(currentPage);
    }

    expect(targetUser instanceof Object).to.be.true;

    cy.log('User id', this.targetUserId);
    cy.log('User', targetUser);

  });

  it.skip('Update created user', async () => {
    const url = 'https://gorest.co.in/public-api/users';
    const userData = {
      "name": "Danilo Teste",
      "email": "danilo46@gmail.com",
      "gender": "Male",
      "status": "Active"
  };

  const response =  await axios.post(url, userData, baseConfig);
  const data = response.data;

  expect(response.status).to.equal(200);
  expect(data.code).to.equal(201);

  const userId = data.data.id;

  expect(userId > 0).to.be.true;
  });
})
