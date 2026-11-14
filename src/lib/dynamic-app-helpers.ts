import { FieldSpec } from '@/types/dynamic-app';

/**
 * Converts an array of records to RFC-4180 compliant CSV string and triggers browser download
 */
export function exportRecordsToCsv(
  records: Array<Record<string, any>>,
  fields: FieldSpec[],
  filename: string
) {
  if (!records.length) return;

  // Header row
  const headers = ['id', ...fields.map(f => f.name)];
  const headerLabels = ['ID', ...fields.map(f => f.label || f.name)];

  const csvRows: string[] = [];
  csvRows.push(headerLabels.map(escapeCsvValue).join(','));

  // Data rows
  records.forEach(record => {
    const row = headers.map(header => {
      const val = record[header];
      return escapeCsvValue(val);
    });
    csvRows.push(row.join(','));
  });

  const csvContent = csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvValue(val: any): string {
  if (val === undefined || val === null) return '""';
  const stringVal = String(val);
  // If contains commas, double quotes, or newlines, quote and escape double quotes
  if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n') || stringVal.includes('\r')) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return `"${stringVal}"`;
}

/**
 * Simple client-side CSV parser that maps columns to entity fields
 */
export function parseCsvToRecords(
  csvText: string,
  fields: FieldSpec[]
): Array<Record<string, any>> {
  const lines = csvText.split(/\r\n|\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header line
  const rawHeaders = splitCsvLine(lines[0]);
  const headerMap: Array<{ index: number; fieldName: string }> = [];

  rawHeaders.forEach((header, idx) => {
    const clean = header.trim().toLowerCase().replace(/['"]/g, '');
    if (clean === 'id' || clean === 'key') {
      headerMap.push({ index: idx, fieldName: 'id' });
      return;
    }
    const matchedField = fields.find(
      f => f.name.toLowerCase() === clean || f.label.toLowerCase() === clean
    );
    if (matchedField) {
      headerMap.push({ index: idx, fieldName: matchedField.name });
    }
  });

  const parsedRecords: Array<Record<string, any>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    if (!values.length) continue;

    const record: Record<string, any> = {
      id: `REC-${Math.floor(100 + Math.random() * 900)}`,
    };

    headerMap.forEach(({ index, fieldName }) => {
      if (values[index] !== undefined) {
        let rawVal = values[index].trim();
        // remove wrapping quotes
        if (rawVal.startsWith('"') && rawVal.endsWith('"')) {
          rawVal = rawVal.substring(1, rawVal.length - 1).replace(/""/g, '"');
        }
        record[fieldName] = rawVal;
      }
    });

    parsedRecords.push(record);
  }

  return parsedRecords;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  result.push(current.trim());
  return result;
}

/**
 * Generates realistic sample record values for any entity schema
 */
export function generateSampleRecord(
  fields: FieldSpec[],
  existingCount: number = 0
): Record<string, any> {
  const sample: Record<string, any> = {
    id: `REC-${Math.floor(100 + Math.random() * 900)}`,
  };

  const sampleNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Sigma', 'Prime', 'Apex', 'Core'];
  const sampleSuffix = sampleNames[existingCount % sampleNames.length];

  fields.forEach(field => {
    const nameLower = field.name.toLowerCase();

    if (field.options && field.options.length > 0) {
      // Pick next option in round-robin
      sample[field.name] = field.options[existingCount % field.options.length];
      return;
    }

    if (field.type === 'number') {
      const min = field.validation?.min ?? 1;
      const max = field.validation?.max ?? 100;
      sample[field.name] = Math.floor(Math.random() * (max - min + 1)) + min;
      return;
    }

    if (field.type === 'email') {
      sample[field.name] = `operator.${sampleSuffix.toLowerCase()}@enterprise.internal`;
      return;
    }

    if (field.type === 'date') {
      const today = new Date();
      sample[field.name] = today.toISOString().split('T')[0];
      return;
    }

    if (field.type === 'textarea') {
      sample[field.name] = `Operational dispatch notes for ${sampleSuffix} unit. Verified technical telemetry and compliance criteria.`;
      return;
    }

    if (field.type === 'boolean') {
      sample[field.name] = existingCount % 2 === 0;
      return;
    }

    // Default text field
    if (nameLower.includes('title') || nameLower.includes('subject') || nameLower.includes('name')) {
      sample[field.name] = `${sampleSuffix} Service Delivery ${existingCount + 1}`;
    } else {
      sample[field.name] = `Standard ${field.label} ${sampleSuffix}`;
    }
  });

  return sample;
}

