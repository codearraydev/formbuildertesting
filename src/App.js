import React, { useCallback, useRef } from 'react';
import './App.css';

import {
  formEngineRsuiteCssLoader,
  ltrCssLoader,
  rsErrorMessage,
  RsLocalizationWrapper,
  rsTooltip,
  rSuiteComponents,
  rtlCssLoader
} from '@react-form-builder/components-rsuite';

import { ActionDefinition, BiDi, Validators } from '@react-form-builder/core';
import { BuilderView, FormBuilder } from '@react-form-builder/designer';

// Here you can pass the metadata of your components
const componentsMetadata = rSuiteComponents.map(definer => definer.build());

const builderView = new BuilderView(componentsMetadata)
  // Pass an array of template names to the withTemplates function to display them in the designer
  .withTemplates([])
  // The following parameters are required for correct CSS loading in LTR and RTL modes
  .withViewerWrapper(RsLocalizationWrapper)
  .withCssLoader(BiDi.LTR, ltrCssLoader)
  .withCssLoader(BiDi.RTL, rtlCssLoader)
  .withCssLoader('common', formEngineRsuiteCssLoader);

// This is where you can define the custom storage for the designer
const formStorage = undefined;

// You can define custom validators for form fields
const customValidators = {
  'string': {
    'isHex': {
      validate: value => /^[0-9A-F]*$/i.test(value)
    },
    'isHappy': {
      params: [],
      validate: value => value === 'Happy'
    },
    'equals': {
      params: [
        { key: 'value', type: 'string', required: false, default: 'Ring' },
        { key: 'message', type: 'string', required: false, default: 'Value must be equals to ' }
      ],
      validate: (value, _, args) => {
        const errorMessage = args?.['message'];
        const checkedValue = args?.['value'];
        const errorResult = errorMessage ? errorMessage + checkedValue : false;
        return value !== args?.['value'] ? errorResult : true;
      }
    }
  },
  'number': {},
  'boolean': {
    'onlyTrue': {
      validate: value => value === true
    }
  },
};

// Example form, in JSON format
const emptyForm = `{
  "version": "1",
  "tooltipType": "RsTooltip",
  "errorType": "RsErrorMessage",
  "form": {
    "key": "Screen",
    "type": "Screen",
    "props": {},
    "children": [
      {
        "key": "name",
        "type": "RsInput",
        "props": {
          "placeholder": {
            "value": "Enter your name"
          },
          "label": {
            "value": "Name"
          }
        },
        "schema": {
          "validations": [
            {
              "key": "required"
            }
          ]
        },
        "tooltipProps": {
          "text": {
            "value": "Name"
          }
        }
      },
      {
        "key": "password",
        "type": "RsInput",
        "props": {
          "label": {
            "value": "Password"
          },
          "passwordMask": {
            "value": true
          }
        },
        "schema": {
          "validations": [
            {
              "key": "required"
            }
          ]
        },
        "tooltipProps": {
          "text": {
            "value": "Password"
          },
          "placement": {
            "value": "left"
          }
        }
      },
      {
        "key": "submit",
        "type": "RsButton",
        "props": {
          "children": {
            "value": "Login"
          },
          "color": {
            "value": "blue"
          },
          "appearance": {
            "value": "primary"
          }
        },
        "events": {
          "onClick": [
            {
              "name": "validate",
              "type": "common"
            },
            {
              "name": "logEventArgs",
              "type": "custom"
            }
          ]
        }
      }
    ]
  },
  "localization": {},
  "languages": [
    {
      "code": "en",
      "dialect": "US",
      "name": "English",
      "description": "American English",
      "bidi": "ltr"
    }
  ],
  "defaultLanguage": "en-US"
}`;

const formName = 'Example';

async function getFormFn(name) {
  if (name === formName) return emptyForm;
  throw new Error(`Form '${name}' is not found.`);
}

function App() {
  const ref = useRef();

  const setRef = useCallback((viewer) => {
    if (viewer) {
      // if you want to work with the internal FormViewer component in an imperative style
      ref.current = viewer;
      console.log(ref.current);
    }
  }, []);

  // custom function for localizing component properties
  const localizeFn = useCallback((componentStore, language) => {
    // localizes only the component whose key has the value "password"
    return componentStore.key === 'submit' && language.code === 'en'
      ? { 'children': `Submit` }
      : {};
  }, []);

  return (
    <div className="app">
      <div className="app-header">
        <h1>🚀 FormEngine.io Drag & Drop Form Builder</h1>
                    </div>
      <div className="app-content">
        <FormBuilder
          view={builderView}
          getForm={getFormFn}
          formName={formName}
          initialData={({})}
          formStorage={formStorage}
          localize={localizeFn}
          onFormDataChange={({ data, errors }) => {
            console.log('onFormDataChange', { data, errors });
          }}
          viewerRef={setRef}
          validators={customValidators}
          actions={{
            logEventArgs: e => console.log(e),
            assertArgs: ActionDefinition.functionalAction((e, args) => {
              console.log(e, args);
            }, {
              p1: 'string',
              p2: 'boolean',
              p3: 'number'
            })
          }}
        />
                  </div>
    </div>
  );
}

export default App;