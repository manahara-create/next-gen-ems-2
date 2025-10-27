import * as XLSX from 'xlsx';

// Excel-only report generator
export const excelReportGenerator = {
  // Generate Excel Report for specific table
  generateExcel: async (tableName, data, reportConfig) => {
    console.log('🎬 ===== EXCEL REPORT GENERATION STARTED =====');
    console.log('📋 Excel Report details:', { tableName, data: data?.length });

    try {
      const tableConfig = reportConfig.tableConfigs[tableName];
      const headers = tableConfig?.columns || Object.keys(data[0] || {});
      
      if (!data || data.length === 0) {
        const fileName = `${tableName}_empty_report_${Date.now()}.xlsx`;
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([['No data available']]);
        XLSX.utils.book_append_sheet(wb, ws, 'Empty Data');
        XLSX.writeFile(wb, fileName);
        return { success: true, fileName };
      }

      // Prepare worksheet data
      const worksheetData = [
        headers.map(h => 
          typeof h === 'string' ? h.replace(/_/g, ' ').toUpperCase() : String(h)
        ),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '-';
            if (typeof value === 'boolean') return value ? 'Yes' : 'No';
            if (typeof value === 'object' && value instanceof Date) {
              return new Date(value);
            }
            if (typeof value === 'string' && value.includes('T')) {
              return new Date(value);
            }
            return value;
          })
        )
      ];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set column widths
      const colWidths = headers.map(() => ({ wch: 20 }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, `${tableName.substring(0, 30)}_data`);

      // Generate Excel file
      const fileName = `${tableName}_report_${Date.now()}.xlsx`;
      XLSX.writeFile(wb, fileName);

      console.log('✅ Excel report generated successfully:', fileName);
      return { success: true, fileName };

    } catch (error) {
      console.error('💥 Excel report generation failed:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== EXCEL REPORT GENERATION COMPLETED =====');
    }
  },

  // Generate Summary Excel Report with multiple sheets
  generateSummaryExcel: async (allData, role) => {
    console.log('🎬 ===== SUMMARY EXCEL REPORT GENERATION STARTED =====');
    console.log('📋 Summary Excel Report details:', { tables: Object.keys(allData), role });

    try {
      const wb = XLSX.utils.book_new();

      // Add summary sheet
      const summaryData = [
        ['Summary Report', '', '', ''],
        ['Generated on:', new Date().toLocaleString(), '', ''],
        ['Role:', role, '', ''],
        ['', '', '', ''],
        ['Table Name', 'Record Count', 'Generated Date', 'Status']
      ];

      Object.keys(allData).forEach(tableName => {
        const data = allData[tableName] || [];
        summaryData.push([
          tableName.replace(/_/g, ' ').toUpperCase(),
          data.length,
          new Date().toLocaleDateString(),
          data.length > 0 ? 'Success' : 'No Data'
        ]);
      });

      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

      // Add data sheets for each table
      Object.keys(allData).forEach(tableName => {
        const data = allData[tableName];
        if (data && data.length > 0) {
          const headers = Object.keys(data[0]);
          const worksheetData = [
            headers.map(h => 
              typeof h === 'string' ? h.replace(/_/g, ' ').toUpperCase() : String(h)
            ),
            ...data.map(row => 
              headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) return '-';
                if (typeof value === 'boolean') return value ? 'Yes' : 'No';
                if (typeof value === 'object' && value instanceof Date) {
                  return new Date(value);
                }
                if (typeof value === 'string' && value.includes('T')) {
                  return new Date(value);
                }
                return value;
              })
            )
          ];

          const ws = XLSX.utils.aoa_to_sheet(worksheetData);
          XLSX.utils.book_append_sheet(wb, ws, tableName.substring(0, 30));
        }
      });

      const fileName = `${role}_summary_report_${Date.now()}.xlsx`;
      XLSX.writeFile(wb, fileName);

      console.log('✅ Summary Excel report generated successfully:', fileName);
      return { success: true, fileName };

    } catch (error) {
      console.error('💥 Summary Excel report generation failed:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== SUMMARY EXCEL REPORT GENERATION COMPLETED =====');
    }
  }
};