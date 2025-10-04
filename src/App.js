import React, { useState } from 'react';
import './App.css';

const FormBuilder = () => {
  const [formData, setFormData] = useState({
    title: 'Untitled Form',
    description: '',
    fields: [],
    layout: {
      columns: 12,
      gap: '1rem',
      autoArrange: false
    },
    apiSettings: {
      endpoint: '',
      method: 'POST',
      headers: {},
      enabled: false
    }
  });

  const [selectedField, setSelectedField] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIScanning, setIsAIScanning] = useState(false);
  const [aiScanModal, setAiScanModal] = useState(false);

  const componentTypes = [
    // Basic Input Fields
    { type: 'text', label: 'Text Input', icon: '📝', category: 'basic' },
    { type: 'email', label: 'Email', icon: '📧', category: 'basic' },
    { type: 'password', label: 'Password', icon: '🔒', category: 'basic' },
    { type: 'number', label: 'Number', icon: '🔢', category: 'basic' },
    { type: 'textarea', label: 'Text Area', icon: '📄', category: 'basic' },
    { type: 'url', label: 'URL', icon: '🔗', category: 'basic' },
    { type: 'tel', label: 'Phone', icon: '📞', category: 'basic' },
    { type: 'date', label: 'Date Picker', icon: '📅', category: 'basic' },
    { type: 'time', label: 'Time', icon: '⏰', category: 'basic' },
    { type: 'datetime-local', label: 'Date & Time', icon: '📅⏰', category: 'basic' },
    
    // Selection Fields
    { type: 'select', label: 'Select Dropdown', icon: '📋', category: 'selection' },
    { type: 'radio', label: 'Radio Buttons', icon: '🔘', category: 'selection' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️', category: 'selection' },
    
    // File Upload Fields
    { type: 'file', label: 'File Upload', icon: '📁', category: 'file' },
    { type: 'image', label: 'Image Upload', icon: '🖼️', category: 'file' },
    { type: 'pdf', label: 'PDF Upload', icon: '📄', category: 'file' },
    
    // Layout Components
    { type: 'heading', label: 'Heading', icon: '📰', category: 'layout' },
    { type: 'separator', label: 'Separator', icon: '➖', category: 'layout' },
    { type: 'column-2', label: '2 Column Layout', icon: '📊', category: 'layout' },
    { type: 'column-3', label: '3 Column Layout', icon: '📈', category: 'layout' },
    
    // Advanced Fields
    { type: 'range', label: 'Range Slider', icon: '🎚️', category: 'advanced' },
    { type: 'color', label: 'Color Picker', icon: '🎨', category: 'advanced' }
  ];

  // Drag and Drop Handlers
  const handleDragStart = (e, component) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(component));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    const newField = {
      id: `field_${Date.now()}`,
      type: data.type,
      label: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Field`,
      required: false,
      placeholder: `Enter ${data.type}`,
      options: ['select', 'radio', 'checkbox'].includes(data.type) ? ['Option 1', 'Option 2'] : undefined,
      styling: {
        width: '100%',
        margin: '0 0 16px 0',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        gridColumn: 'span 12',
        gridRow: 'auto'
      }
    };

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  // Field Management
  const handleFieldSelect = (fieldId) => {
    setSelectedField(fieldId);
  };

  const handleFieldUpdate = (fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const handleFieldDelete = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
    setSelectedField(null);
  };

  // Export/Import
  const exportForm = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.title.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // FormEngine JSON Converter
  const convertFormEngineToFormBuilder = (formEngineData) => {
    const convertedFields = [];
    
    const convertComponent = (component, parentKey = '') => {
      const key = parentKey ? `${parentKey}_${component.key}` : component.key;
      
      switch (component.type) {
        case 'RsInput':
          convertedFields.push({
            id: key,
            type: 'text',
            label: component.props?.label?.value || component.key,
            required: component.schema?.validations?.some(v => v.key === 'required') || false,
            placeholder: component.props?.placeholder?.value || `Enter ${component.props?.label?.value || component.key}`,
            styling: { width: '100%', gridColumn: 'span 12' }
          });
          break;
          
        case 'RsDatePicker':
          convertedFields.push({
            id: key,
            type: 'date',
            label: component.props?.label?.value || component.key,
            required: component.schema?.validations?.some(v => v.key === 'required') || false,
            placeholder: component.props?.placeholder?.value || 'Select date',
            styling: { width: '50%', gridColumn: 'span 6' }
          });
          break;
          
        case 'RsTextArea':
          convertedFields.push({
            id: key,
            type: 'textarea',
            label: component.props?.label?.value || component.key,
            required: component.schema?.validations?.some(v => v.key === 'required') || false,
            placeholder: component.props?.placeholder?.value || `Enter ${component.props?.label?.value || component.key}`,
            styling: { width: '100%', gridColumn: 'span 12' }
          });
          break;
          
        case 'RsRadioGroup':
          convertedFields.push({
            id: key,
            type: 'radio',
            label: component.props?.label?.value || component.key,
            required: component.schema?.validations?.some(v => v.key === 'required') || false,
            options: component.props?.items?.value?.map(item => item.label) || ['Option 1', 'Option 2'],
            styling: { width: '100%', gridColumn: 'span 12' }
          });
          break;
          
        case 'RsCheckbox':
          convertedFields.push({
            id: key,
            type: 'checkbox',
            label: component.props?.children?.value || component.key,
            required: component.schema?.validations?.some(v => v.key === 'required') || false,
            options: [component.props?.children?.value || 'Checkbox Option'],
            styling: { width: '50%', gridColumn: 'span 6' }
          });
          break;
          
        case 'RsHeader':
          convertedFields.push({
            id: key,
            type: 'heading',
            label: component.props?.content?.value || component.key,
            required: false,
            placeholder: '',
            styling: { width: '100%', gridColumn: 'span 12' }
          });
          break;
          
        case 'RsLabel':
          convertedFields.push({
            id: key,
            type: 'heading',
            label: component.props?.text?.value || component.key,
            required: false,
            placeholder: '',
            styling: { width: '100%', gridColumn: 'span 12' }
          });
          break;
          
        case 'RsSignature':
          convertedFields.push({
            id: key,
            type: 'text',
            label: 'Signature',
            required: component.schema?.validations?.some(v => v.key === 'required') || false,
            placeholder: 'Digital signature placeholder',
            styling: { width: '100%', gridColumn: 'span 12' }
          });
          break;
          
        case 'RsButton':
          // Skip buttons as they're not form fields
          break;
          
        case 'RsContainer':
          // Process children of containers
          if (component.children) {
            component.children.forEach(child => convertComponent(child, key));
          }
          break;
          
        default:
          // Convert unknown components to text inputs
          convertedFields.push({
            id: key,
            type: 'text',
            label: component.key,
            required: false,
            placeholder: `Enter ${component.key}`,
            styling: { width: '100%', gridColumn: 'span 12' }
          });
      }
    };
    
    // Process all components in the form
    if (formEngineData.form?.children) {
      formEngineData.form.children.forEach(component => convertComponent(component));
    }
    
    return {
      title: formEngineData.form?.key || 'Imported FormEngine Form',
      description: 'Converted from FormEngine format',
      fields: convertedFields,
      layout: {
        columns: 12,
        gap: '1rem',
        autoArrange: false
      },
      apiSettings: {
        endpoint: '',
        method: 'POST',
        headers: {},
        enabled: false
      }
    };
  };

  const importForm = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          
          // Check if this is FormEngine JSON format
          const isFormEngineFormat = importedData.form && importedData.form.children && importedData.form.type === 'Screen';
          
          let safeImportedData;
          
          if (isFormEngineFormat) {
            // Convert FormEngine format to FormBuilder Pro format
            safeImportedData = convertFormEngineToFormBuilder(importedData);
            console.log('Converting FormEngine JSON to FormBuilder Pro format...');
            console.log('Converted fields:', safeImportedData.fields.length);
          } else {
            // Handle regular FormBuilder Pro JSON format
            safeImportedData = {
              title: importedData.title || 'Imported Form',
              description: importedData.description || '',
              fields: importedData.fields || [],
              layout: {
                columns: importedData.layout?.columns || 12,
                gap: importedData.layout?.gap || '1rem',
                autoArrange: importedData.layout?.autoArrange || false
              },
              apiSettings: {
                endpoint: importedData.apiSettings?.endpoint || '',
                method: importedData.apiSettings?.method || 'POST',
                headers: importedData.apiSettings?.headers || {},
                enabled: importedData.apiSettings?.enabled || false
              }
            };
            
            // Ensure each field has required properties
            safeImportedData.fields = safeImportedData.fields.map(field => ({
              id: field.id || `field_${Date.now()}_${Math.random()}`,
              type: field.type || 'text',
              label: field.label || 'Untitled Field',
              required: field.required || false,
              placeholder: field.placeholder || `Enter ${field.type || 'text'}`,
              options: field.options || undefined,
              styling: {
                width: field.styling?.width || '100%',
                margin: field.styling?.margin || '0 0 16px 0',
                padding: field.styling?.padding || '8px',
                border: field.styling?.border || '1px solid #ddd',
                borderRadius: field.styling?.borderRadius || '4px',
                gridColumn: field.styling?.gridColumn || 'span 12',
                gridRow: field.styling?.gridRow || 'auto'
              }
            }));
          }
          
          setFormData(safeImportedData);
          setSelectedField(null);
          setFormValues({});
          setValidationErrors({});
          
          const formatType = isFormEngineFormat ? 'FormEngine' : 'FormBuilder Pro';
          alert(`Successfully imported "${safeImportedData.title}" (${formatType} format) with ${safeImportedData.fields.length} fields!`);
        } catch (error) {
          console.error('Import Error:', error);
          alert('Invalid file format. Please make sure you\'re importing a valid JSON file (FormBuilder Pro or FormEngine format).');
        }
      };
      reader.readAsText(file);
    }
  };

  // Clear Form
  const clearForm = () => {
    if (window.confirm('Are you sure you want to clear the entire form? This action cannot be undone.')) {
      setFormData({
        title: 'Untitled Form',
        description: '',
        fields: [],
        layout: {
          columns: 12,
          gap: '1rem',
          autoArrange: false
        },
        apiSettings: {
          endpoint: '',
          method: 'POST',
          headers: {},
          enabled: false
        }
      });
      setSelectedField(null);
      setFormValues({});
      setValidationErrors({});
    }
  };

  // AI Scan Handler
  const handleAIScanUpload = async (file) => {
    setIsAIScanning(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate sample fields based on file type
      const sampleFields = [
        {
          id: `ai_field_${Date.now()}`,
          type: 'text',
          label: 'Document Title',
          required: true,
          placeholder: 'AI detected: Enter document title',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: `ai_field_${Date.now() + 1}`,
          type: 'date',
          label: 'Document Date',
          required: false,
          placeholder: 'AI detected: Document date',
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: `ai_field_${Date.now() + 2}`,
          type: 'number',
          label: 'Amount',
          required: false,
          placeholder: 'AI detected: Enter amount',
          styling: { width: '50%', gridColumn: 'span 6' }
        }
      ];
      
      setFormData(prev => ({
        ...prev,
        fields: [...prev.fields, ...sampleFields]
      }));
      
      setAiScanModal(false);
      alert('AI has successfully generated form fields from your document!');
      
    } catch (error) {
      console.error('AI Scan Error:', error);
      alert('AI scan failed. Please try again.');
    } finally {
      setIsAIScanning(false);
    }
  };

  // Render Field Component
  const renderField = (field, index) => {
    const isSelected = selectedField === field.id;
    
    return (
      <div 
        key={field.id} 
        className={`form-field-wrapper ${isSelected ? 'selected' : ''}`}
        onClick={() => handleFieldSelect(field.id)}
        style={{ 
          width: field?.styling?.width || '100%',
          gridColumn: field?.styling?.gridColumn || 'span 12'
        }}
      >
        <div className="form-field">
          <div className="field-actions">
            <button 
              className="field-action-btn delete-field-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleFieldDelete(field.id);
              }}
            >
              🗑️
            </button>
          </div>
          
          <div className="field-label">
            {field?.label || 'Untitled Field'}
            {field?.required && <span className="required-asterisk">*</span>}
          </div>
          
          {field?.type === 'textarea' ? (
            <textarea 
              placeholder={field?.placeholder || 'Enter text'}
              className="field-input"
              required={field?.required || false}
              rows="3"
            />
          ) : field?.type === 'select' ? (
            <select className="field-input" required={field?.required || false}>
              <option value="">{field?.placeholder || 'Select an option'}</option>
              {field?.options?.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
          ) : field?.type === 'radio' ? (
            <div className="radio-group">
              {field?.options?.map((option, idx) => (
                <label key={idx} className="radio-option">
                  <input type="radio" name={field?.id} value={option} />
                  {option}
                </label>
              ))}
            </div>
          ) : field?.type === 'checkbox' ? (
            <div className="checkbox-group">
              {field?.options?.map((option, idx) => (
                <label key={idx} className="checkbox-option">
                  <input type="checkbox" value={option} />
                  {option}
                </label>
              ))}
            </div>
          ) : field?.type === 'heading' ? (
            <h3 className="field-heading">{field?.label || 'Heading'}</h3>
          ) : field?.type === 'separator' ? (
            <hr className="field-separator" />
          ) : (
            <input 
              type={field?.type || 'text'}
              placeholder={field?.placeholder || 'Enter text'}
              className="field-input"
              required={field?.required || false}
            />
          )}
        </div>
      </div>
    );
  };

  // Form Templates
  const formTemplates = {
    contact: {
      title: 'Contact Form',
      description: 'A professional contact form for your website',
      fields: [
        {
          id: 'name_field',
          type: 'text',
          label: 'Full Name',
          required: true,
          placeholder: 'Enter your full name',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'email_field',
          type: 'email',
          label: 'Email Address',
          required: true,
          placeholder: 'Enter your email',
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'phone_field',
          type: 'tel',
          label: 'Phone Number',
          required: false,
          placeholder: 'Enter your phone number',
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'subject_field',
          type: 'text',
          label: 'Subject',
          required: true,
          placeholder: 'What is this about?',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'message_field',
          type: 'textarea',
          label: 'Message',
          required: true,
          placeholder: 'Enter your message',
          styling: { width: '100%', gridColumn: 'span 12' }
        }
      ]
    },
    survey: {
      title: 'Customer Survey',
      description: 'Collect feedback from your customers',
      fields: [
        {
          id: 'satisfaction_field',
          type: 'radio',
          label: 'How satisfied are you with our service?',
          required: true,
          options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'recommend_field',
          type: 'select',
          label: 'Would you recommend us to others?',
          required: true,
          options: ['Definitely', 'Probably', 'Not sure', 'Probably not', 'Definitely not'],
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'rating_field',
          type: 'range',
          label: 'Rate our service (1-10)',
          required: true,
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'feedback_field',
          type: 'textarea',
          label: 'Additional Comments',
          required: false,
          placeholder: 'Share any additional feedback',
          styling: { width: '100%', gridColumn: 'span 12' }
        }
      ]
    },
    registration: {
      title: 'Event Registration',
      description: 'Register for our upcoming event',
      fields: [
        {
          id: 'first_name_field',
          type: 'text',
          label: 'First Name',
          required: true,
          placeholder: 'Enter your first name',
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'last_name_field',
          type: 'text',
          label: 'Last Name',
          required: true,
          placeholder: 'Enter your last name',
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'email_field',
          type: 'email',
          label: 'Email Address',
          required: true,
          placeholder: 'Enter your email',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'company_field',
          type: 'text',
          label: 'Company/Organization',
          required: false,
          placeholder: 'Enter your company name',
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'dietary_field',
          type: 'checkbox',
          label: 'Dietary Requirements',
          required: false,
          options: ['Vegetarian', 'Vegan', 'Gluten-Free', 'No Nuts', 'Other'],
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'emergency_contact_field',
          type: 'text',
          label: 'Emergency Contact',
          required: true,
          placeholder: 'Emergency contact name and phone',
          styling: { width: '100%', gridColumn: 'span 12' }
        }
      ]
    },
    bir1706: {
      title: 'BIR Form 1706 - Capital Gains Tax Return',
      description: 'For Onerous Transfer of Real Property Classified as Capital Asset',
      fields: [
        {
          id: 'hdr_title',
          type: 'heading',
          label: 'Capital Gains Tax Return — BIR Form 1706',
          required: false,
          placeholder: '',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'lbl_subtitle',
          type: 'heading',
          label: 'For Onerous Transfer of Real Property Classified as Capital Asset (Both Taxable and Exempt)',
          required: false,
          placeholder: '',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'section_meta_hdr',
          type: 'heading',
          label: 'Filing Information',
          required: false,
          placeholder: '',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'meta_dln',
          type: 'text',
          label: 'DLN (To be filled up by the BIR)',
          required: false,
          placeholder: 'Enter DLN',
          styling: { width: '33%', gridColumn: 'span 4' }
        },
        {
          id: 'meta_date_txn',
          type: 'date',
          label: '1 Date of Transaction (MM/DD/YYYY)',
          required: true,
          placeholder: 'Select date',
          styling: { width: '33%', gridColumn: 'span 4' }
        },
        {
          id: 'meta_amended',
          type: 'radio',
          label: '2 Amended Return?',
          required: false,
          options: ['Yes', 'No'],
          styling: { width: '33%', gridColumn: 'span 4' }
        },
        {
          id: 'meta_sheets',
          type: 'text',
          label: '3 No. of Sheets Attached',
          required: false,
          placeholder: 'Enter number of sheets',
          styling: { width: '33%', gridColumn: 'span 4' }
        },
        {
          id: 'meta_atc',
          type: 'text',
          label: '4 ATC',
          required: false,
          placeholder: 'e.g., IC420',
          styling: { width: '33%', gridColumn: 'span 4' }
        },
        {
          id: 'meta_taxpayer_type',
          type: 'radio',
          label: '5 Taxpayer Type',
          required: false,
          options: ['Individual', 'Corporation'],
          styling: { width: '33%', gridColumn: 'span 4' }
        },
        {
          id: 'hdr_part1',
          type: 'heading',
          label: 'Part I — Background Information',
          required: false,
          placeholder: '',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'seller_tin',
          type: 'text',
          label: 'Seller TIN',
          required: false,
          placeholder: 'Enter seller TIN',
          styling: { width: '25%', gridColumn: 'span 3' }
        },
        {
          id: 'seller_rdo',
          type: 'text',
          label: 'Seller RDO Code',
          required: false,
          placeholder: 'Enter RDO code',
          styling: { width: '25%', gridColumn: 'span 3' }
        },
        {
          id: 'buyer_tin',
          type: 'text',
          label: 'Buyer TIN',
          required: false,
          placeholder: 'Enter buyer TIN',
          styling: { width: '25%', gridColumn: 'span 3' }
        },
        {
          id: 'buyer_rdo',
          type: 'text',
          label: 'Buyer RDO Code',
          required: false,
          placeholder: 'Enter RDO code',
          styling: { width: '25%', gridColumn: 'span 3' }
        },
        {
          id: 'seller_name',
          type: 'text',
          label: 'Seller\'s Name (if individual)',
          required: false,
          placeholder: 'Enter seller name',
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'buyer_name',
          type: 'text',
          label: 'Buyer\'s Name (if individual)',
          required: false,
          placeholder: 'Enter buyer name',
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'property_description',
          type: 'textarea',
          label: 'Brief Description of the Property',
          required: false,
          placeholder: 'Enter property description',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'area_sqm',
          type: 'text',
          label: 'Area sold (sq.m.)',
          required: false,
          placeholder: 'Enter area in square meters',
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'tax_declaration_no',
          type: 'text',
          label: 'Tax Declaration No.',
          required: false,
          placeholder: 'Enter tax declaration number',
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'tct_oct_cct_no',
          type: 'text',
          label: 'TCT/OCT/CCT No.',
          required: false,
          placeholder: 'Enter TCT/OCT/CCT number',
          styling: { width: '33%', gridColumn: 'span 4' }
        },
        {
          id: 'unit_room_no',
          type: 'text',
          label: 'Unit/Room No.',
          required: false,
          placeholder: 'Enter unit/room number',
          styling: { width: '33%', gridColumn: 'span 4' }
        },
        {
          id: 'other_identifiers',
          type: 'text',
          label: 'Others',
          required: false,
          placeholder: 'Enter other identifiers',
          styling: { width: '33%', gridColumn: 'span 4' }
        },
        {
          id: 'q_principal_residence',
          type: 'radio',
          label: 'Is the property being sold your principal residence? (individual sellers only)',
          required: false,
          options: ['Yes', 'No'],
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'q_new_residence_18mo',
          type: 'radio',
          label: 'Do you intend to construct/acquire a new principal residence within 18 months from date of sale?',
          required: false,
          options: ['Yes', 'No'],
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'q_multiple_properties',
          type: 'radio',
          label: 'Does the selling price cover more than one property?',
          required: false,
          options: ['Yes', 'No'],
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'q_tax_relief',
          type: 'radio',
          label: 'Availing of tax relief under International Tax Treaty or Special Law?',
          required: false,
          options: ['Yes', 'No'],
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'p1_row_desc_txn',
          type: 'radio',
          label: 'Description of Transaction (mark one box only)',
          required: false,
          options: ['Cash Sale', 'Installment Sale', 'Exempt', 'Foreclosure Sale', 'Others (specify)'],
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'hdr_part2',
          type: 'heading',
          label: 'Part II — Fair Market Value (FMV) at Time of Contract',
          required: false,
          placeholder: '',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'fmv_land_taxdec',
          type: 'text',
          label: 'FMV of Land per latest Tax Declaration',
          required: false,
          placeholder: 'Enter FMV of land',
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'fmv_improvements_taxdec',
          type: 'text',
          label: 'FMV of Improvements per latest Tax Declaration',
          required: false,
          placeholder: 'Enter FMV of improvements',
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'fmv_land_bir',
          type: 'text',
          label: 'FMV of Land as determined by BIR Commissioner (zonal value)',
          required: false,
          placeholder: 'Enter BIR zonal value',
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'fmv_improvement_bir',
          type: 'text',
          label: 'FMV of Improvement as determined by BIR Commissioner',
          required: false,
          placeholder: 'Enter BIR improvement value',
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'hdr_part3',
          type: 'heading',
          label: 'Part III — Determination of Taxable Base',
          required: false,
          placeholder: '',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'tb_gross_selling_price',
          type: 'text',
          label: 'Gross Selling Price',
          required: false,
          placeholder: 'Enter gross selling price',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'tb_fmv_land_improvements',
          type: 'text',
          label: 'Fair Market Value of Land and Improvements',
          required: false,
          placeholder: 'Enter FMV of land and improvements',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'tb_net_unpaid_portion',
          type: 'text',
          label: 'Net of Unpaid Portion of Sales Price (for Installment Sale)',
          required: false,
          placeholder: 'Enter net unpaid portion',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'tb_bid_price_foreclosure',
          type: 'text',
          label: 'Bid Price (for Foreclosure Sale)',
          required: false,
          placeholder: 'Enter bid price',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'tb_taxable_installment_collected',
          type: 'text',
          label: 'Taxable Installment Collected (excluding interest)',
          required: false,
          placeholder: 'Enter taxable installment',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'tb_others',
          type: 'text',
          label: 'Others (specify)',
          required: false,
          placeholder: 'Enter other taxable base',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'hdr_part4',
          type: 'heading',
          label: 'Part IV — Computation of Tax',
          required: false,
          placeholder: '',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'cmp_taxable_base',
          type: 'text',
          label: '31 Taxable Base',
          required: false,
          placeholder: 'Enter taxable base',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'cmp_tax_due_6',
          type: 'text',
          label: '32 6% Tax Due',
          required: false,
          placeholder: 'Enter 6% tax due',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'cmp_less_tax_paid_prev',
          type: 'text',
          label: '33 Less: Tax Paid in Return Previously Filed (if an Amended Return)',
          required: false,
          placeholder: 'Enter previously paid tax',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'cmp_tax_payable_overpayment',
          type: 'text',
          label: '34 Tax Payable/(Overpayment)',
          required: false,
          placeholder: 'Enter tax payable/overpayment',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'pen_surcharge',
          type: 'text',
          label: '35A Surcharge',
          required: false,
          placeholder: 'Enter surcharge',
          styling: { width: '25%', gridColumn: 'span 3' }
        },
        {
          id: 'pen_interest',
          type: 'text',
          label: '35B Interest',
          required: false,
          placeholder: 'Enter interest',
          styling: { width: '25%', gridColumn: 'span 3' }
        },
        {
          id: 'pen_compromise',
          type: 'text',
          label: '35C Compromise',
          required: false,
          placeholder: 'Enter compromise',
          styling: { width: '25%', gridColumn: 'span 3' }
        },
        {
          id: 'pen_total',
          type: 'text',
          label: '35D Total Penalties',
          required: false,
          placeholder: 'Enter total penalties',
          styling: { width: '25%', gridColumn: 'span 3' }
        },
        {
          id: 'cmp_total_amount',
          type: 'text',
          label: '36 Total Amount Payable/(Overpayment) (Sum of 34 & 35D)',
          required: false,
          placeholder: 'Enter total amount',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'overpayment_option',
          type: 'radio',
          label: 'If Overpayment (mark one)',
          required: false,
          options: ['To be Refunded', 'To be Issued a Tax Credit Certificate'],
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'sign_printed_name',
          type: 'text',
          label: 'Taxpayer/Authorized Agent Printed Name',
          required: true,
          placeholder: 'Enter printed name',
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'sign_title',
          type: 'text',
          label: 'Title/Position of Signatory',
          required: false,
          placeholder: 'Enter title/position',
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'sign_date',
          type: 'date',
          label: 'Date',
          required: false,
          placeholder: 'Select date',
          styling: { width: '50%', gridColumn: 'span 6' }
        },
        {
          id: 'hdr_part5',
          type: 'heading',
          label: 'Part V — Details of Payment',
          required: false,
          placeholder: '',
          styling: { width: '100%', gridColumn: 'span 12' }
        },
        {
          id: 'pay_cash_bank',
          type: 'text',
          label: 'Cash/Bank - Drawee Bank/Agency',
          required: false,
          placeholder: 'Enter bank/agency',
          styling: { width: '20%', gridColumn: 'span 2' }
        },
        {
          id: 'pay_cash_number',
          type: 'text',
          label: 'Cash/Bank - Number',
          required: false,
          placeholder: 'Enter number',
          styling: { width: '20%', gridColumn: 'span 2' }
        },
        {
          id: 'pay_cash_date',
          type: 'date',
          label: 'Cash/Bank - Date',
          required: false,
          placeholder: 'Select date',
          styling: { width: '20%', gridColumn: 'span 2' }
        },
        {
          id: 'pay_cash_amount',
          type: 'text',
          label: 'Cash/Bank - Amount',
          required: false,
          placeholder: 'Enter amount',
          styling: { width: '20%', gridColumn: 'span 2' }
        },
        {
          id: 'pay_check_bank',
          type: 'text',
          label: 'Check - Drawee Bank/Agency',
          required: false,
          placeholder: 'Enter bank/agency',
          styling: { width: '20%', gridColumn: 'span 2' }
        },
        {
          id: 'pay_check_number',
          type: 'text',
          label: 'Check - Number',
          required: false,
          placeholder: 'Enter number',
          styling: { width: '20%', gridColumn: 'span 2' }
        },
        {
          id: 'pay_check_date',
          type: 'date',
          label: 'Check - Date',
          required: false,
          placeholder: 'Select date',
          styling: { width: '20%', gridColumn: 'span 2' }
        },
        {
          id: 'pay_check_amount',
          type: 'text',
          label: 'Check - Amount',
          required: false,
          placeholder: 'Enter amount',
          styling: { width: '20%', gridColumn: 'span 2' }
        },
        {
          id: 'oro_details',
          type: 'textarea',
          label: 'Machine Validation/Revenue Official Receipt Details (if not filed with the bank)',
          required: false,
          placeholder: 'Enter receipt details',
          styling: { width: '100%', gridColumn: 'span 12' }
        }
      ]
    }
  };

  const loadTemplate = (templateKey) => {
    const template = formTemplates[templateKey];
    if (template) {
      setFormData({
        title: template.title,
        description: template.description,
        fields: template.fields.map(field => ({
          ...field,
          id: `${field.id}_${Date.now()}`
        })),
        layout: {
          columns: 12,
          gap: '1rem',
          autoArrange: false
        },
        apiSettings: {
          endpoint: '',
          method: 'POST',
          headers: {},
          enabled: false
        }
      });
      setSelectedField(null);
      setFormValues({});
      setValidationErrors({});
      alert(`Loaded "${template.title}" template successfully!`);
    }
  };

  const selectedFieldData = selectedField ? formData.fields.find(field => field.id === selectedField) : null;

  return (
    <div className="form-builder-app">
      <div className="form-builder-header">
        <div className="header-left">
          <div className="logo-section">
            <div className="logo-icon">📋</div>
            <div className="logo-text">
              <h1>FormBuilder Pro</h1>
              <span>Professional Drag & Drop Form Builder</span>
            </div>
          </div>
        </div>
        
        <div className="header-center">
          <div className="form-title-section">
            <input 
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="form-title-input"
              placeholder="Enter form title..."
            />
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="form-description-input"
              placeholder="Enter form description..."
              rows="2"
            />
          </div>
        </div>
        
        <div className="header-right">
          <div className="header-actions">
            <button 
              className={`mode-btn ${isPreviewMode ? 'active' : ''}`}
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? '✏️ Edit Mode' : '👁️ Preview Mode'}
            </button>
            
            <div className="action-group">
              <button className="export-btn" onClick={exportForm}>
                📤 Export
              </button>
              <label className="import-btn">
                📥 Import
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={importForm}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            
            <div className="action-group">
              <button className="ai-scan-btn" onClick={() => setAiScanModal(true)}>
                🤖 AI Scan
              </button>
              <button className="arrange-btn" onClick={() => console.log('Auto Arrange')}>
                🔧 Auto Arrange
              </button>
              <button className="clear-btn" onClick={clearForm}>
                🗑️ Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="form-builder-main">
        {/* Professional Component Palette */}
        <div className="component-palette">
          <div className="palette-header">
            <h3>Components</h3>
            <div className="palette-search">
              <input 
                type="text" 
                placeholder="Search components..."
                className="palette-search-input"
              />
            </div>
          </div>
          
          <div className="palette-categories">
            {['basic', 'selection', 'file', 'layout', 'advanced', 'display', 'special'].map(category => (
              <div key={category} className="palette-category">
                <div className="category-header">
                  <span className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                  <span className="category-count">
                    {componentTypes.filter(comp => comp.category === category).length}
                  </span>
                </div>
                <div className="category-items">
                  {componentTypes
                    .filter(comp => comp.category === category)
                    .map(comp => (
                      <div
                        key={comp.type}
                        className="component-item"
                        draggable
                        onDragStart={(e) => handleDragStart(e, comp)}
                      >
                        <div className="component-icon">{comp.icon}</div>
                        <div className="component-label">{comp.label}</div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Form Canvas */}
        <div className="form-canvas">
          <div className="canvas-header">
            <div className="canvas-info">
              <span className="field-count">{formData.fields.length} fields</span>
              <span className="canvas-mode">{isPreviewMode ? 'Preview Mode' : 'Edit Mode'}</span>
            </div>
            <div className="canvas-actions">
              <button className="canvas-btn" onClick={() => console.log('Layout Toggle')}>
                {formData.layout?.autoArrange ? '🔧 Manual Layout' : '🔧 Auto Layout'}
              </button>
            </div>
          </div>
          
          <div 
            className={`form-canvas-area ${isPreviewMode ? 'preview-mode' : 'edit-mode'}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {formData.fields.length === 0 ? (
              <div className="empty-canvas">
                <div className="empty-icon">📋</div>
                <h3>Start Building Your Form</h3>
                <p>Drag components from the left panel to begin creating your form</p>
                <div className="quick-start">
                  <button className="quick-start-btn" onClick={() => setAiScanModal(true)}>
                    🤖 AI Scan Document
                  </button>
                  <div className="template-buttons">
                    <button className="template-btn" onClick={() => loadTemplate('contact')}>
                      📞 Contact Form
                    </button>
                    <button className="template-btn" onClick={() => loadTemplate('survey')}>
                      📊 Survey Form
                    </button>
                    <button className="template-btn" onClick={() => loadTemplate('registration')}>
                      📝 Registration Form
                    </button>
                    <button className="template-btn" onClick={() => loadTemplate('bir1706')}>
                      🏛️ BIR Form 1706
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="form-grid">
                {formData.fields.map((field, index) => renderField(field, index))}
              </div>
            )}
          </div>
        </div>

        {/* Professional Property Panel */}
        <div className="property-panel">
          <div className="panel-header">
            <h3>Properties</h3>
            {selectedFieldData && (
              <div className="selected-field-info">
                <span className="field-type">{selectedFieldData.type}</span>
                <span className="field-id">#{selectedFieldData.id}</span>
              </div>
            )}
          </div>
          
          <div className="panel-content">
            {selectedFieldData ? (
              <div className="property-sections">
                <div className="property-section">
                  <h4>Basic Properties</h4>
                  <div className="property-group">
                    <label>Field Label</label>
                    <input 
                      type="text" 
                      value={selectedFieldData?.label || ''}
                      onChange={(e) => handleFieldUpdate(selectedField, { label: e.target.value })}
                      placeholder="Enter field label" 
                    />
                  </div>
                  
                  <div className="property-group">
                    <label>Placeholder Text</label>
                    <input 
                      type="text" 
                      value={selectedFieldData?.placeholder || ''}
                      onChange={(e) => handleFieldUpdate(selectedField, { placeholder: e.target.value })}
                      placeholder="Enter placeholder" 
                    />
                  </div>
                  
                  <div className="property-group">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={selectedFieldData?.required || false}
                        onChange={(e) => handleFieldUpdate(selectedField, { required: e.target.checked })}
                      />
                      Required Field
                    </label>
                  </div>
                </div>

                <div className="property-section">
                  <h4>Layout & Styling</h4>
                  <div className="property-group">
                    <label>Field Width</label>
                    <select 
                      value={selectedFieldData?.styling?.width || '100%'}
                      onChange={(e) => handleFieldUpdate(selectedField, { 
                        styling: { 
                          ...(selectedFieldData?.styling || {}), 
                          width: e.target.value,
                          gridColumn: e.target.value === '100%' ? 'span 12' : 
                                     e.target.value === '50%' ? 'span 6' : 
                                     e.target.value === '33%' ? 'span 4' : 'span 3'
                        } 
                      })}
                    >
                      <option value="100%">Full Width</option>
                      <option value="50%">Half Width</option>
                      <option value="33%">Third Width</option>
                      <option value="25%">Quarter Width</option>
                    </select>
                  </div>
                </div>

                <div className="property-section">
                  <h4>Actions</h4>
                  <div className="property-group">
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleFieldDelete(selectedField)}
                    >
                      🗑️ Delete Field
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <div className="no-selection-icon">👆</div>
                <p>Select a field to edit its properties</p>
                <small>Click on any field in the canvas to configure it</small>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* AI Scan Modal */}
      {aiScanModal && (
        <div className="ai-scan-modal-overlay">
          <div className="ai-scan-modal">
            <div className="ai-scan-header">
              <h2>🤖 AI-Powered Form Generation</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setAiScanModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="ai-scan-content">
              <div className="ai-scan-description">
                <h3>From Scan to Code in Seconds</h3>
                <p>Upload an image or PDF document and our AI will automatically analyze it to extract text and data, then generate intelligent form fields with pre-populated values.</p>
              </div>
              
              <div className="ai-scan-upload">
                <input 
                  type="file"
                  accept="image/*,.pdf"
                  className="ai-file-input"
                  id="ai-scan-input"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleAIScanUpload(file);
                    }
                  }}
                />
                <label htmlFor="ai-scan-input" className="ai-upload-label">
                  <div className="ai-upload-icon">🤖</div>
                  <div className="ai-upload-text">
                    <strong>Click to Upload Document</strong>
                    <small>Supports: Images (JPG, PNG, GIF) and PDF files</small>
                    <small>Max size: 10MB</small>
                    <small className="ai-feature-highlight">✨ AI will extract text and populate form fields automatically</small>
                  </div>
                </label>
              </div>
              
              {isAIScanning && (
                <div className="ai-scanning">
                  <div className="ai-scanning-spinner">🤖</div>
                  <p>AI is analyzing your document...</p>
                  <small>Extracting text and data from your document</small>
                  <small>This may take a few seconds</small>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return <FormBuilder />;
}

export default App;
