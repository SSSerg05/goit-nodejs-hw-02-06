// const fs = require('fs/promises')

// const listContacts = async () => {}

// const getContactById = async (contactId) => {}

// const removeContact = async (contactId) => {}

// const addContact = async (body) => {}

// const updateContact = async (contactId, body) => {}

// export default {
//   listContacts,
//   getContactById,
//   removeContact,
//   addContact,
//   updateContact,
// }

import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const contactsPath = path.resolve('db', 'contacts.json');

// Read File DataBase
//=======================
// @param {string} [fileName]
// 
// @return [{...},{...}] || null - array of objects || null
const readData = async (fileName) => {
  try {
    const data = await fs.readFile(fileName);
    return JSON.parse(data);

  } catch (error) {
    console.log(`Cannot read file or file not found. ${error}`);
  }

  return null;
}

// Update File DataBase
//=======================
// @param {string} data
// 
// @return undefined
const updateData = (data) =>
  fs.writeFile(contactsPath, JSON.stringify(data, null, 2))


// List Contacts
//=======================
// @return [{...},{...},{...}] || null
export const listContacts = async () => {

  const data = await readData(contactsPath);

  return data || null;
}


// get Contact By Id
//=======================
// @param {object} {id}
// 
// @return {...} || null - object || null
export const getContactById = async ({ id }) => {

  const data = await readData(contactsPath);
  const result = data.find(item => item.id === id)

  return result || null;
}


// remove field without DataBase file 
//=======================
// @param {object} {id}
// 
// @return {...} || null - object || null
export const removeContact = async({ id }) => {

  const removeField = await getContactById({ id });

  if (!removeField) { 
    return null
  }
  
  const data = await readData(contactsPath);
  const result = data.filter(item => item.id !== id)
  await updateData(result);

  return removeField;
}


// Add Contact in DataBase file
//=======================
// @param {object} {name, email, phone}
// 
// @return {...} || null - object || null
export const addContact = async ({ name, email, phone }) => {

  const data = await readData(contactsPath);
  const newField = {id: nanoid(), name, email, phone};
  const result = [ ...data, newField ];

  await updateData(result);

  return newField;
}

// update Contact in DataBase file
//=======================
// @param {string} contactId
// @param {object} {body}
// 
// @return {...} || null - object || null
const updateContact = async (contactId, body) => { 
  
  return null;
}


export default {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}