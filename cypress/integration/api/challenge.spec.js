/// <reference types="cypress" />
const axios = require('axios').default;
const faker = require('faker');

context('API', () => {
  const API = {
    USERS: 'https://gorest.co.in/public-api/users',
  };
  const accessToken = '2275e2cbbf8dc1d113b25fb018cdb2e07e088b35bb5f7b7c13ca160ed96a82ba';
  const baseConfig = { headers: { 'Authorization': `Bearer ${accessToken}` } };

  context('Base scenarios', () => {

    beforeEach(async function () {
      const userData = {
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        email: `${faker.datatype.number()}${faker.internet.email()}`,
        gender: "Male",
        status: "Active"
      };
  
      const response = await axios.post(API.USERS, userData, baseConfig);
  
      if (response.data.code === 201) {
        const user = response.data.data;
  
        this.targetUserId = user.id;
      }
      else
        throw Error('We were not able to create a user')
    })
  
    it('Check created valid user is available on list end-point', async function () {
      let targetUser;
      let pages = 1;
      let page = 1;
      const visitedPages = [];
  
      // TODO: consider iterate over a filled pages array instead of decresing page number
      while (!targetUser && visitedPages.length < pages) {
        const response = await axios.get(`${API.USERS}?page=${page}`, baseConfig);
  
        const users = response.data.data;
        const pagination = response.data.meta.pagination;
        const currentPage = page;
  
        pages = pagination.pages;
        targetUser = users.find(u => u.id === this.targetUserId);
  
        page = pages - visitedPages.length;
        visitedPages.push(currentPage);
      }
  
      expect(targetUser instanceof Object).to.be.true;
    });
  
    it(`Update created user's name`, async function () {
      const newName = `${faker.name.firstName()} ${faker.name.lastName()}`;
      const url = `${API.USERS}/${this.targetUserId}`;
      const userDataToBeUpdated = { name: newName };
  
      const putResponse = await axios.put(url, userDataToBeUpdated, baseConfig);
      const getResponse = await axios.get(url, baseConfig);
  
      expect(putResponse.status).to.equal(200);
      expect(getResponse.status).to.equal(200);
  
      const updatedUser = putResponse.data.data;
      const retrievedUser = putResponse.data.data;
  
  
      expect(retrievedUser.name).to.equal(newName);
      expect(updatedUser).to.equal(retrievedUser);
    });
  
    it('Delete created user', async function () {
      const url = `${API.USERS}/${this.targetUserId}`;
  
      const deleteResponse = await axios.delete(url, baseConfig);
      const getResponse = await axios.get(url, baseConfig);
  
      expect(deleteResponse.status).to.equal(200);
      expect(deleteResponse.data.code).to.equal(204);
  
      expect(getResponse.status).to.equal(200);
      expect(getResponse.data.code).to.equal(404);
      expect(getResponse.data.data.message).to.equal('Resource not found');
    });
  });

  it('Check that a deleted user is not listed any more', async function () {
    const response = await axios.get(API.USERS, baseConfig);

    expect(response.status).to.equal(200);
    expect(response.data.code).to.equal(200);

    const userToBeDeleted = response.data.data[0];
    const url = `${API.USERS}/${userToBeDeleted.id}`;

    const deleteResponse = await axios.delete(url, baseConfig);
    expect(deleteResponse.status).to.equal(200);
    expect(deleteResponse.data.code).to.equal(204);

    const listResponse = await axios.get(API.USERS, baseConfig);

    expect(response.status).to.equal(200);
    expect(response.data.code).to.equal(200);

    const notfoundUser = listResponse.data.data.find (u => u.id === userToBeDeleted.id);

    expect(notfoundUser).to.equal(undefined);
  });
})
