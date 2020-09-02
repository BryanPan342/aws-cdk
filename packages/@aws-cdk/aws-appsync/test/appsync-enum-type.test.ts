import '@aws-cdk/assert/jest';
import * as cdk from '@aws-cdk/core';
import * as appsync from '../lib';
import * as t from './scalar-type-defintions';

const out = 'enum Test {\n  test1\n  test2\n  test3\n}\n';
let stack: cdk.Stack;
let api: appsync.GraphqlApi;
beforeEach(() => {
  // GIVEN
  stack = new cdk.Stack();
  api = new appsync.GraphqlApi(stack, 'api', {
    name: 'api',
  });
});

describe('testing Enum Type properties', () => {
  test('EnumType configures properly', () => {
    // WHEN
    const test = new appsync.EnumType('Test', {
      definition: ['test1', 'test2', 'test3'],
    });
    api.addType(test);

    // THEN
    expect(stack).toHaveResourceLike('AWS::AppSync::GraphQLSchema', {
      Definition: `${out}`,
    });
    expect(stack).not.toHaveResource('AWS::AppSync::Resolver');
  });

  test('EnumType can addField', () => {
    // WHEN
    const test = new appsync.EnumType('Test', {
      definition: ['test1', 'test2'],
    });
    api.addType(test);
    test.addField({ fieldName: 'test3' });

    // THEN
    expect(stack).toHaveResourceLike('AWS::AppSync::GraphQLSchema', {
      Definition: `${out}`,
    });
  });

  test('EnumType can be a GraphqlType', () => {
    // WHEN
    const test = new appsync.EnumType('Test', {
      definition: ['test1', 'test2', 'test3'],
    });
    api.addType(test);

    api.addType(new appsync.ObjectType('Test2', {
      definition: { enum: test.attribute() },
    }));

    const obj = 'type Test2 {\n  enum: Test\n}\n';

    // THEN
    expect(stack).toHaveResourceLike('AWS::AppSync::GraphQLSchema', {
      Definition: `${out}${obj}`,
    });
  });

  test('appsync errors when enum type is configured with white space', () => {
    // THEN
    expect(() => {
      new appsync.EnumType('Test', {
        definition: ['test 1', 'test2', 'test3'],
      });
    }).toThrowError('The allowed values of an Enum Type must not have white space. Remove the spaces in "test 1"');
  });

  test('appsync errors on enum type when the fieldName in addField has white space', () => {
    // WHEN
    const test = new appsync.EnumType('Test', {
      definition: [],
    });
    // THEN
    expect(() => {
      test.addField({ fieldName: ' ' });
    }).toThrowError('The allowed values of an Enum Type must not have white space. Remove the spaces in " "');
  });

  test('appsync errors when enum type is configured with field options', () => {
    // WHEN
    const test = new appsync.EnumType('Test', {
      definition: [],
    });
    // THEN
    expect(() => {
      test.addField({ fieldName: 'test', field: t.string });
    }).toThrowError('Enum Types do not support IField properties. Use the fieldName option.');
  });

  test('appsync errors when enum type is missing fieldName option', () => {
    // WHEN
    const test = new appsync.EnumType('Test', {
      definition: [],
    });
    // THEN
    expect(() => {
      test.addField({});
    }).toThrowError('When adding a field to an Enum Type, you must configure the fieldName option.');
  });
});