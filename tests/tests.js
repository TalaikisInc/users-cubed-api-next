/* eslint-disable semi */
import { resolve } from 'path';
import { randomBytes } from 'crypto';
import AWSMock from 'mock-aws-s3';
import { describe, it, before, after, afterEach } from 'mocha';
import faker from 'faker';
// import request from 'supertest'
import Jm from 'js-meter';
import sinon from 'sinon';
import { assert } from 'chai';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import rimraf from 'rimraf';

import { USERS_BUCKET_NAME, API_KEY } from '../app/config';
import { encode, decode, encodeRequest, decodeResponse } from '../app/lib/proto';
import { handlers, handlerSchema } from '../app/handlers';
import { dialCodeSchema, countriesSchema, dialCodes, countries } from '../app/lib/schemas';
import { en, langSchema } from '../app/lib/translations/locales/en';
import { setLocale, t } from '../app/lib/translations';
import { validEmail, _request, sendErr, sendOk, finalizeRequest, response } from '../app/lib/utils';
import { randomID, tokenHeader, hash, md5, uuidv4, xss, encrypt, decrypt } from '../app/lib/security';
import db, { joinedTableDelete } from '../app/lib/db';
import { _mailgun } from '../app/lib/email/mailgun';
import { _twilio } from '../app/lib/phone/twilio';
import { mochaAsync } from './helpers'
require('dotenv').config({ path: resolve(__dirname, '../.env.development') });
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-asserttype-extra'))
  .use(require('chai-as-promised'))
  .use(require('chai-json-schema'))
  .use(require('chai-uuid'))
  .use(require('sinon-chai'))
  .should();
AWSMock.config.basePath = resolve(__dirname, 'buckets');
const s3 = AWSMock.S3({ params: { Bucket: USERS_BUCKET_NAME } });
// const server = request('http://localhost:4000')

describe('API tests', () => {
  const id1 = faker.internet.email();

  before((done) => {
    const params = { Bucket: USERS_BUCKET_NAME };
    s3.createBucket(params, (err) => {
      if (err) {
        console.error(err);
      } else {
        done();
      }
    });
  });

  after((done) => {
    const params = { Bucket: USERS_BUCKET_NAME };
    s3.deleteBucket(params, (err) => {
      if (err) {
        console.error(err);
      } else {
        done();
      }
    });
  });

  describe('Db', () => {
    it('Db save should work', (done) => {
      const table = 'users';
      const data = { name: 'John', phone: '+000000000' };

      db.create(table, id1, data).catch((e) => done(e));
      done();
    });

    it('Db read should work', (done) => {
      const table = 'users';
      const data = { name: 'John', phone: '+000000000' };

      db.read(table, id1)
        .then((d) => {
          d.should.be.deep.equal(data);
          done();
        })
        .catch((e) => done(e));
    });

    it('Db update should work', (done) => {
      const table = 'users';
      const newData = { name: 'John', phone: '+000000001' };

      db.update(table, id1, newData)
        .then((d) => {
          d.should.be.deep.equal(newData);
          done();
        })
        .catch((e) => done(e));
    });

    it('Db list should work', (done) => {
      const table = 'users';
      const id2 = faker.internet.email();
      const id3 = faker.internet.email();
      const id4 = faker.internet.email();
      const data = { name: 'John', phone: '+000000000' };

      db.create(table, id2, data)
        .then(async () => {
          await db.create(table, id3, data).catch((e) => done(e));
          await db.create(table, id4, data).catch((e) => done(e));
          const ls = await db.listDir(table).catch((e) => done(e));
          ls.length.should.be.equal(4);
          done();
        })
        .catch((e) => done(e));
    });

    it('Db destroy should work', (done) => {
      const table = 'users';

      db.destroy(table, id1)
        .then(async () => {
          const ls = await db.listDir(table).catch((e) => done(e));
          ls.length.should.be.equal(3);
          done();
        })
        .catch((e) => done(e));
    });

    it('Join delete should work', async () => {
      const table1 = 'purchases';
      const cols = ['1', '2', '3'];
      const data = { test: 'test' };
      await db.create(table1, cols[0], data).catch((e) => e);
      await db.create(table1, cols[1], data).catch((e) => e);
      await db.create(table1, cols[2], data).catch((e) => e);
      const ls = await db.listDir(table1).catch((e) => e);
      ls.length.should.be.equal(3);
      await joinedTableDelete(table1, cols).catch((e) => e);
      const ls1 = await db.listDir(table1).catch((e) => e);
      ls1.length.should.be.equal(0);
    });
  });

  describe('Third APIs', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Request should work', (done) => {
      const callback = sinon.spy();
      const schemaLib = 'https';
      const obj = {
        data: {
          protocol: 'https:',
          hostname: 'google.com',
          method: 'GET',
          path: '/'
        }
      };
      _request(schemaLib, obj, callback);
      assert(callback.calledOnce);
      done();
    });

    it('Email sending should work', async (done) => {
      const callback = sinon.spy();
      await _mailgun('info@talaikis.com', 'Test subject', 'This is message', callback);
      assert(callback.called);
    });

    it('SMS sending should work', async (done) => {
      const callback = sinon.spy();
      await _twilio('10000000000', 'This is message', callback);
      assert(callback.called);
    });
  });

  describe('Objects', () => {
    it('Test countries object', (done) => {
      countries.should.be.jsonSchema(countriesSchema);
      done();
    });

    it('Test dial codes object', (done) => {
      dialCodes.should.be.jsonSchema(dialCodeSchema);
      done();
    });

    it('Test translations object', (done) => {
      en.should.be.jsonSchema(langSchema);
      done();
    });
  });

  describe('Responses', () => {
    it('Send error should work', async () => {
      const res = await sendErr(400, 'Test Error')
      res.body.should.be.equal('CgpUZXN0IEVycm9y');
      res.headers['Content-Type'].should.be.equal('application/x-protobuf');
      res.statusCode.should.be.equal(400);
      res.isBase64Encoded.should.be.equal(true);
    });

    it('Send ok status should work', async () => {
      const res = await sendOk()
      res.body.should.be.equal('CgJPaw==');
      res.headers['Content-Type'].should.be.equal('application/x-protobuf');
      res.statusCode.should.be.equal(200);
      res.isBase64Encoded.should.be.equal(true);
    });

    it('Response finalization should work', (done) => {
      finalizeRequest('users', 'test@test.com', 'create', { data: 'data' }, (_, res) => {
        res.o.status.should.be.equal('ok');
        res.s.should.be.equal(200);
        done();
      });
    });
  });

  describe('Functions', () => {
    it('Test handlers object', (done) => {
      handlers.should.be.jsonSchema(handlerSchema);
      done();
    });

    it('Token header checker should not crash with empty body', (done) => {
      const payload = {};
      tokenHeader(payload)
        .then(() => {
          done();
        })
        .catch(() => done());
    });

    it('Hashing should work', (done) => {
      const payload = 'test';
      hash(payload)
        .then((h) => {
          h.should.be.string();
          done();
        })
        .catch((e) => done(e));
    });

    it('XSS should work', (done) => {
      const payload = { body: '<a><a><a>' };
      xss(payload)
        .then((cleaned) => {
          cleaned.body.should.be.equal('&lt;a>&lt;a>&lt;a>');
          done();
        })
        .catch((e) => done(e));
    });

    it('MD5 should work', (done) => {
      const data = 'test string 123456789 ###@~';
      const m = md5(data);
      m.should.be.equal('c20e23fd5e8994922eea49239a9a2131');
      done();
    });

    it('Uuidv4 should work correctly', (done) => {
      const uid = uuidv4();
      uid.should.be.a.uuid('v4');
      done();
    });
  });

  it('Encryption should work', (done) => {
    const iv = randomBytes(16).toString('hex');
    const data = 'lorem ipsum';
    const key = randomBytes(32).toString('hex');
    encrypt(data, key, iv)
      .then((encrypted) => {
        encrypted.should.be.string();
        done();
      })
      .catch((e) => done(e));
  });

  it('Decryption should work', (done) => {
    const iv = randomBytes(16).toString('hex');
    const data = 'lorem ipsum';
    const key = randomBytes(32).toString('hex');
    encrypt(data, key, iv)
      .then(async (encrypted) => {
        const decrypted = await decrypt(encrypted, key, iv).catch((e) => done(e));
        decrypted.should.be.equal(data);
        done();
      })
      .catch((e) => done(e));
  });

  it('Test translation system', async () => {
    await setLocale({ body: { locale: 'fr' } });
    const fr = `${t('error.unauthorized')}`;
    fr.should.be.equal('Non autorisé.');
  });

  it('Test email validation system', async () => {
    const v1 = await validEmail('info@talaikis.com');
    const v2 = await validEmail('infotalaikis.com');
    const v3 = await validEmail('info@zdgfgzfd.com');
    v1.should.be.equal('info@talaikis.com');
    v2.should.be.equal(false);
    v3.should.be.equal(false);
  });

  it('Should generate random IDs', (done) => {
    randomID(50)
      .then((n) => {
        n.should.be.string();
        n.length.should.be.equal(100);
        done();
      })
      .catch((e) => done(e));
  });

  it('Should pass collisions test', (done) => {
    const b = [];
    randomID(12)
      .then(async (n) => {
        for (let i = 0; i < 100000; i++) {
          const n1 = await randomID(12);
          b.push(n1);
          n.should.not.equal(n1);
          if (b.length === 100000) {
            done();
          }
        }
      })
      .catch((e) => done(e));
  });

  it('Should encode and decode protobuffers', (done) => {
    const action = 'USER_CREATE';
    const email = faker.internet.email();
    const password = faker.internet.password();
    const testPath = 'decoderTest';
    const messageType = 'DecoderTest';
    const output = {
      action,
      email,
      password,
      tosAgreement: true
    };
    encode(testPath, output, messageType)
      .then((buffer) => {
        const str = buffer.toString('base64');
        str.should.be.string();
        decode(testPath, str, messageType)
          .then((obj) => {
            obj.should.be.deep.equal(output);
            done();
          })
          .catch((e) => done(e));
      })
      .catch((e) => done(e));
  });

  it('Encoder should not break on wrong data', (done) => {
    const testPath = 'decoderTest';
    const messageType = 'DecoderTest';
    const output = {
      action: 10,
      email: true,
      password: true,
      tosAgreement: 'test'
    };
    encode(testPath, output, messageType)
      .then((buffer) => {
        const str = buffer.toString('base64');
        str.should.be.string();
        done();
      })
      .catch(() => done());
  });

  it('Decoder should not break on wrong data', (done) => {
    const testPath = 'decoderTest';
    const messageType = 'DecoderTest';
    const output = {
      action: 10,
      email: true,
      password: true,
      tosAgreement: 'test'
    };
    encode(testPath, output, messageType)
      .then((buffer) => {
        const str = buffer.toString('base64')
        ;(typeof str).should.be.equal('string');
        decode(testPath, str, messageType)
          .then((obj) => {
            obj.should.be.deep.equal(output);
            done();
          })
          .catch(() => done());
      })
      .catch(() => done());
  });

  describe('User', () => {
    const email1 = faker.internet.email();
    const password1 = faker.internet.password();

    it('Should create user', async () => {
      const filePath = handlers['USER_CREATE'].file;
      const messageType = handlers['USER_CREATE'].class;
      const output = {
        email: email1,
        password: password1,
        tosAgreement: true,
        locale: 'en'
      };
      const buffer = await encodeRequest(filePath, output, messageType).catch((e) => e);
      const event = {
        body: buffer.toString('base64'),
        headers: {
          Action: 'USER_CREATE',
          Accept: 'application/x-protobuf',
          'X-API-Key': API_KEY
        }
      };

      const res = await response(event)
      res.body.should.equal('CgJvaw==');
      res.headers.Action.should.equal('UserCreate');
      res.headers['Content-Type'].should.be.equal('application/x-protobuf');
      res.statusCode.should.equal(200);
      res.isBase64Encoded.should.equal(true);
    });

    it('Handler lifecycle should return errors', async () => {
      const filePath = handlers['USER_CREATE'].file;
      const messageType = handlers['USER_CREATE'].class;
      const output = {
        email: 'a',
        password: 'a',
        tosAgreement: true,
        locale: 'en'
      };
      const buffer = await encodeRequest(filePath, output, messageType).catch((e) => e);
      const event = {
        body: buffer.toString('base64'),
        headers: {
          Action: 'USER_CREATE',
          Accept: 'application/x-protobuf',
          'X-API-Key': API_KEY
        }
      };

      const res = await response(event)
      res.body.should.equal('ChhNaXNzaW5nIHJlcXVpcmVkIGZpZWxkcy4=');
      res.headers.Action.should.equal('Error');
      res.headers['Content-Type'].should.be.equal('application/x-protobuf');
      res.statusCode.should.be.equal(400);
      res.isBase64Encoded.should.be.equal(true);
    });

    it('Should not allow calls w/o API key', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const filePath = handlers['USER_CREATE'].file;
      const messageType = handlers['USER_CREATE'].class;
      const output = {
        email,
        password,
        tosAgreement: true,
        locale: 'en'
      };
      const buffer = await encodeRequest(filePath, output, messageType).catch((e) => e);
      const event = {
        body: buffer.toString('base64'),
        headers: {
          Action: 'USER_CREATE',
          Accept: 'application/x-protobuf',
          'X-API-Key': 'wrong'
        }
      };

      const res = await response(event)
      res.body.should.equal('Cg1VbmF1dGhvcml6ZWQu');
      res.headers.Action.should.equal('Error');
      res.headers['Content-Type'].should.be.equal('application/x-protobuf');
      res.statusCode.should.be.equal(403);
      res.isBase64Encoded.should.be.equal(true);
    });

    it('Should confirm account', async () => {
      const filePath = handlers['CONFIRM'].file;
      const messageType = handlers['CONFIRM'].class;
      const d = resolve(__dirname, 'buckets', USERS_BUCKET_NAME, 'confirms');
      const dir = readdirSync(d);
      const f = readFileSync(resolve(d, dir[0]), 'utf8');
      const o = JSON.parse(f);
      o.email.should.be.equal(email1);
      o.expiry.should.be.above(Date.now());
      o.token.should.be.equal(dir[0]);

      const output = {
        token: o.token,
        locale: 'en'
      };
      const buffer = await encodeRequest(filePath, output, messageType).catch((e) => e);
      const event = {
        body: buffer.toString('base64'),
        headers: {
          Action: 'CONFIRM',
          Accept: 'application/x-protobuf',
          'X-API-Key': API_KEY
        }
      };

      const res = await response(event)
      res.body.should.equal('CgJvaw==');
      res.headers.Action.should.equal('Confirm');
      res.headers['Content-Type'].should.be.equal('application/x-protobuf');
      res.statusCode.should.be.equal(200);
      res.isBase64Encoded.should.be.equal(true);
    });

    it('Should sign in', async () => {
      const filePath = handlers['TOKEN_CREATE'].file;
      const messageType = handlers['TOKEN_CREATE'].class;

      const output = {
        email: email1,
        password: password1,
        locale: 'en'
      };
      const buffer = await encodeRequest(filePath, output, messageType).catch((e) => e);
      const event = {
        body: buffer.toString('base64'),
        headers: {
          Action: 'TOKEN_CREATE',
          Accept: 'application/x-protobuf',
          'X-API-Key': API_KEY
        }
      };

      const res = await response(event)
      const d = resolve(__dirname, 'buckets', USERS_BUCKET_NAME, 'tokens');
      const dir = readdirSync(d);
      const f = readFileSync(resolve(d, dir[0]), 'utf8');
      const o = JSON.parse(f);
      o.expiry.should.be.above(Date.now());
      o.tokenId.should.be.equal(dir[0]);
      o.role.should.be.equal('user');
      o.email.should.be.equal(email1);

      res.headers.Action.should.equal('TokenCreate');
      res.headers['Content-Type'].should.be.equal('application/x-protobuf');
      res.statusCode.should.be.equal(200);
      res.isBase64Encoded.should.be.equal(true);
    });

    it('Should get token', async () => {
      const filePath = handlers['TOKEN_GET'].file;
      const messageType = handlers['TOKEN_GET'].class;
      const d = resolve(__dirname, 'buckets', USERS_BUCKET_NAME, 'tokens');
      const dir = readdirSync(d);
      const f = readFileSync(resolve(d, dir[0]), 'utf8');
      const o = JSON.parse(f);

      const output = {
        tokenId: o.tokenId,
        locale: 'en'
      };
      const buffer = await encodeRequest(filePath, output, messageType).catch((e) => e);
      const event = {
        body: buffer.toString('base64'),
        headers: {
          Action: 'TOKEN_GET',
          Accept: 'application/x-protobuf',
          'X-API-Key': API_KEY
        }
      };

      const res = await response(event)
      res.headers.Action.should.equal('TokenGet');
      res.headers['Content-Type'].should.be.equal('application/x-protobuf');
      res.statusCode.should.be.equal(200);
      res.isBase64Encoded.should.be.equal(true);
    });

    it('Should extend token', async () => {
      const filePath = handlers['TOKEN_EXTEND'].file;
      const messageType = handlers['TOKEN_EXTEND'].class;
      const d = resolve(__dirname, 'buckets', USERS_BUCKET_NAME, 'tokens');
      const dir = readdirSync(d);
      const f = readFileSync(resolve(d, dir[0]), 'utf8');
      const o = JSON.parse(f);
      const expiry = o.expiry;

      const output = {
        tokenId: o.tokenId,
        locale: 'en'
      };
      const buffer = await encodeRequest(filePath, output, messageType).catch((e) => e);
      const event = {
        body: buffer.toString('base64'),
        headers: {
          Action: 'TOKEN_EXTEND',
          Accept: 'application/x-protobuf',
          'X-API-Key': API_KEY
        }
      };

      const res = await response(event)
      res.headers.Action.should.equal('TokenExtend');
      res.headers['Content-Type'].should.be.equal('application/x-protobuf');
      res.statusCode.should.be.equal(200);
      res.isBase64Encoded.should.be.equal(true);
      const f1 = readFileSync(resolve(d, dir[0]), 'utf8');
      const o1 = JSON.parse(f1);
      const newExpiry = o1.expiry;
      newExpiry.should.be.above(expiry);
    });

    it('Should set role', async () => {
      const filePath = handlers['SET_ROLE'].file;
      const messageType = handlers['SET_ROLE'].class;
      const d = resolve(__dirname, 'buckets', USERS_BUCKET_NAME, 'tokens');
      const dir = readdirSync(d);
      const fPath = resolve(d, dir[0]);
      const f = readFileSync(fPath, 'utf8');
      const o = JSON.parse(f);
      o.role = 'admin';
      writeFileSync(fPath, JSON.stringify(o));
      const f1 = readFileSync(fPath, 'utf8');
      const o1 = JSON.parse(f1);
      o1.role.should.be.equal('admin');

      const output = {
        role: 'user',
        locale: 'en'
      };
      const buffer = await encodeRequest(filePath, output, messageType).catch((e) => e);
      const event = {
        body: buffer.toString('base64'),
        headers: {
          Action: 'SET_ROLE',
          Accept: 'application/x-protobuf',
          'X-API-Key': API_KEY,
          Authorization: `Bearer ${o.tokenId}`
        }
      };

      const res = await response(event)
      res.headers.Action.should.equal('SetRole');
      res.headers['Content-Type'].should.be.equal('application/x-protobuf');
      res.statusCode.should.be.equal(200);
      res.isBase64Encoded.should.be.equal(true);
      const f2 = readFileSync(resolve(d, dir[0]), 'utf8');
      const o2 = JSON.parse(f2);
      o2.role.should.be.equal('user');
    });

    it('Should get own account', async () => {
      const filePath = handlers['USER_GET'].file;
      const messageType = handlers['USER_GET'].class;
      const d = resolve(__dirname, 'buckets', USERS_BUCKET_NAME, 'tokens');
      const dir = readdirSync(d);
      const fPath = resolve(d, dir[0]);
      const f = readFileSync(fPath, 'utf8');
      const o = JSON.parse(f);

      const output = {
        locale: 'en'
      };
      const m = new Jm({ isPrint: true, isKb: true });
      const buffer = await encodeRequest(filePath, output, messageType).catch((e) => e);
      const event = {
        body: buffer.toString('base64'),
        headers: {
          Action: 'USER_GET',
          Accept: 'application/x-protobuf',
          'X-API-Key': API_KEY,
          Authorization: `Bearer ${o.tokenId}`
        }
      };

      const res = await response(event)
      res.headers.Action.should.equal('UserGet');
      res.headers['Content-Type'].should.be.equal('application/x-protobuf');
      res.statusCode.should.be.equal(200);
      res.isBase64Encoded.should.be.equal(true);
      const decoded = await decodeResponse(filePath, res.body, messageType).catch((e) => e);
      const meter = m.stop();
      console.log(meter);
      decoded.confirmed.email.should.be.equal(true);
    });

    it('Should edit user', async () => {
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const filePath = handlers['USER_EDIT'].file;
      const messageType = handlers['USER_EDIT'].class;
      const d = resolve(__dirname, 'buckets', USERS_BUCKET_NAME, 'tokens');
      const dir = readdirSync(d);
      const fPath = resolve(d, dir[0]);
      const f = readFileSync(fPath, 'utf8');
      const o = JSON.parse(f);

      const output = {
        email: '',
        firstName: firstName,
        lastName: lastName,
        dialCode: '',
        phone: '',
        address: '',
        zipCode: '',
        city: '',
        country: '',
        dob: '',
        avatarUrl: '',
        locale: 'en'
      };

      const buffer = await encodeRequest(filePath, output, messageType).catch((e) => e);
      const event = {
        body: buffer.toString('base64'),
        headers: {
          Action: 'USER_EDIT',
          Accept: 'application/x-protobuf',
          'X-API-Key': API_KEY,
          Authorization: `Bearer ${o.tokenId}`
        }
      };

      const res = await response(event)
      res.headers.Action.should.equal('UserEdit');
      res.headers['Content-Type'].should.be.equal('application/x-protobuf');
      res.statusCode.should.be.equal(200);
      res.isBase64Encoded.should.be.equal(true);
      const decoded = await decodeResponse(filePath, res.body, messageType).catch((e) => e);
      decoded.firstName.should.be.equal(firstName);
      decoded.lastName.should.be.equal(lastName);
      decoded.email.should.be.equal(o.email);
    });

    it('Should sign out', async () => {
      const filePath = handlers['TOKEN_DESTROY'].file;
      const messageType = handlers['TOKEN_DESTROY'].class;
      const d = resolve(__dirname, 'buckets', USERS_BUCKET_NAME, 'tokens');
      const dir = readdirSync(d);
      const fPath = resolve(d, dir[0]);
      const f = readFileSync(fPath, 'utf8');
      const o = JSON.parse(f);

      const output = {
        locale: 'en'
      };
      const buffer = await encodeRequest(filePath, output, messageType).catch((e) => e);
      const event = {
        body: buffer.toString('base64'),
        headers: {
          Action: 'TOKEN_DESTROY',
          Accept: 'application/x-protobuf',
          'X-API-Key': API_KEY,
          Authorization: `Bearer ${o.tokenId}`
        }
      };

      const res = await response(event)
      res.headers.Action.should.equal('TokenDestroy');
      res.headers['Content-Type'].should.be.equal('application/x-protobuf');
      res.statusCode.should.be.equal(200);
      res.isBase64Encoded.should.be.equal(true);
      const dir1 = readdirSync(d);
      dir1.length.should.be.equal(0);
    });

    it('Should reset password', async () => {
      const filePath = handlers['RESET_CREATE'].file;
      const messageType = handlers['RESET_CREATE'].class;
      const d1 = resolve(__dirname, 'buckets', USERS_BUCKET_NAME, 'confirms');
      rimraf.sync(d1);

      const output = {
        email: email1,
        locale: 'en'
      };
      const buffer = await encodeRequest(filePath, output, messageType).catch((e) => e);
      const event = {
        body: buffer.toString('base64'),
        headers: {
          Action: 'RESET_CREATE',
          Accept: 'application/x-protobuf',
          'X-API-Key': API_KEY
        }
      };

      const res = await response(event)
      res.headers.Action.should.equal('ResetCreate');
      res.headers['Content-Type'].should.be.equal('application/x-protobuf');
      res.statusCode.should.be.equal(200);
      res.isBase64Encoded.should.be.equal(true);
      const dir1 = readdirSync(d1);
      const fPath1 = resolve(d1, dir1[0]);
      const f1 = readFileSync(fPath1, 'utf8');
      const o1 = JSON.parse(f1);
      o1.email.should.be.equal(email1);
      o1.type.should.be.equal('reset');
      o1.expiry.should.be.above(Date.now());
      const token = o1.token;
      const filePath1 = handlers['CONFIRM'].file;
      const messageType1 = handlers['CONFIRM'].class;
      const output1 = {
        token,
        locale: 'en'
      };
      const buffer1 = await encodeRequest(filePath1, output1, messageType1).catch((e) => e);
      const event1 = {
        body: buffer1.toString('base64'),
        headers: {
          Action: 'CONFIRM',
          Accept: 'application/x-protobuf',
          'X-API-Key': API_KEY
        }
      };

      const res1 = await response(event1).catch((e) => e);
      res1.body.should.equal('CgJvaw==');
      res1.headers.Action.should.equal('Confirm');
      res1.headers['Content-Type'].should.be.equal('application/x-protobuf');
      res1.statusCode.should.be.equal(200);
      res1.isBase64Encoded.should.be.equal(true);
    });

    it('Should sign in with social', async () => {
      const filePath = handlers['USER_CREATE_SOCIAL'].file;
      const messageType = handlers['USER_CREATE_SOCIAL'].class;
      const d = resolve(__dirname, 'buckets', USERS_BUCKET_NAME, 'tokens');

      const output = {
        provider: 'auth0',
        idToken: 'test123456789',
        accessToken: 'test123456789',
        locale: 'en'
      };
      const buffer = await encodeRequest(filePath, output, messageType).catch((e) => e);
      const event = {
        body: buffer.toString('base64'),
        headers: {
          Action: 'USER_CREATE_SOCIAL',
          Accept: 'application/x-protobuf',
          'X-API-Key': API_KEY
        }
      };

      const res = await response(event)
      res.headers.Action.should.equal('UserCreateSocial');
      res.headers['Content-Type'].should.be.equal('application/x-protobuf');
      res.statusCode.should.be.equal(200);
      res.isBase64Encoded.should.be.equal(true);
      const userDir = readdirSync(d);
      const fPath = resolve(d, userDir[0]);
      const f = readFileSync(fPath, 'utf8');
      const o = JSON.parse(f);
      o.expiry.should.be.above(Date.now());
      o.role.should.be.equal('user');
      o.email.should.be.equal('info@talaikis.com');
    });

    it('Should delete user', async () => {
      const filePath = handlers['USER_DESTROY'].file;
      const messageType = handlers['USER_DESTROY'].class;
      const d = resolve(__dirname, 'buckets', USERS_BUCKET_NAME, 'tokens');
      const dir = readdirSync(d);
      const fPath = resolve(d, dir[0]);
      const f = readFileSync(fPath, 'utf8');
      const o = JSON.parse(f);
      const d1 = resolve(__dirname, 'buckets', USERS_BUCKET_NAME, 'users');
      const dir1 = readdirSync(d1);
      const dl = dir1.length

      const output = {
        locale: 'en'
      };
      const buffer = await encodeRequest(filePath, output, messageType).catch((e) => e);
      const event = {
        body: buffer.toString('base64'),
        headers: {
          Action: 'USER_DESTROY',
          Accept: 'application/x-protobuf',
          'X-API-Key': API_KEY,
          Authorization: `Bearer ${o.tokenId}`
        }
      };

      const res = await response(event)
      res.body.should.be.equal('CgJvaw==');
      res.headers.Action.should.equal('UserDestroy');
      res.headers['Content-Type'].should.be.equal('application/x-protobuf');
      res.statusCode.should.be.equal(200);
      res.isBase64Encoded.should.be.equal(true);
      const dir2 = readdirSync(d1);
      dir2.length.should.be.equal(dl - 1);
    });
  });

  /*
  describe('Referrals', () => {
    + { action: 'REFER_REFER', to }
    { action: 'REFER_USE', to }
    { action: 'REFER_REGISTER', to }
  })

  describe('Contact us', () => {
    // + { action: 'CONTACT_US', ... }
  })

  describe('Upload', () => {
    // + { action: 'UPLOAD', ... }
  })

  describe('Blog', () => {
  })

  describe('Shop', () => {
  })

  describe('Notifications', () => {
  })
  */
});
