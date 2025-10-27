import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Enhanced report generator with PDF and Excel download
export const reportGenerator = {
  // Generate PDF Report
  generatePDF: async (tableName, data, reportConfig) => {
    console.log('🎬 ===== PDF REPORT GENERATION STARTED =====');
    console.log('📋 PDF Report details:', { tableName, data: data?.length });

    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      const tableConfig = reportConfig.tableConfigs[tableName];
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(`${tableConfig?.displayName || tableName} Report`, 14, 22);
      
      // Add generation info
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
      doc.text(`Total Records: ${data?.length || 0}`, 14, 39);

      if (!data || data.length === 0) {
        doc.text('No data available for report', 14, 50);
        const fileName = `${tableName}_empty_report_${Date.now()}.pdf`;
        doc.save(fileName);
        return { success: true, fileName };
      }

      // Prepare table data
      const headers = tableConfig?.columns || Object.keys(data[0] || {});
      const tableData = data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '-';
          if (typeof value === 'boolean') return value ? 'Yes' : 'No';
          if (typeof value === 'object' && value instanceof Date) {
            return new Date(value).toLocaleDateString();
          }
          if (typeof value === 'string' && value.includes('T')) {
            return new Date(value).toLocaleDateString();
          }
          return String(value);
        })
      );

      // Generate table using autoTable
      doc.autoTable({
        head: [headers.map(h => 
          typeof h === 'string' ? h.replace(/_/g, ' ').toUpperCase() : String(h)
        )],
        body: tableData,
        startY: 45,
        styles: { 
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak'
        },
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 45 }
      });

      // Save PDF
      const fileName = `${tableName}_report_${Date.now()}.pdf`;
      doc.save(fileName);

      console.log('✅ PDF report generated successfully:', fileName);
      return { success: true, fileName };

    } catch (error) {
      console.error('💥 PDF report generation failed:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== PDF REPORT GENERATION COMPLETED =====');
    }
  },

  // Generate Excel Report
  generateExcel: async (tableName, data, reportConfig) => {
    console.log('🎬 ===== EXCEL REPORT GENERATION STARTED =====');
    console.log('📋 Excel Report details:', { tableName, data: data?.length });

    try {
      const tableConfig = reportConfig.tableConfigs[tableName];
      const headers = tableConfig?.columns || Object.keys(data[0] || {});
      
      if (!data || data.length === 0) {
        const fileName = `${tableName}_empty_report_${Date.now()}.xlsx`;
        // Create empty Excel file
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

  // Generate Comprehensive Report (Both PDF and Excel)
  generateComprehensiveReport: async (tableName, data, reportType = 'both') => {
    console.log('🎬 ===== COMPREHENSIVE REPORT GENERATION STARTED =====');
    console.log('📋 Comprehensive Report details:', { tableName, reportType, data: data?.length });

    try {
      const reportConfig = {
        tableConfigs: {
          employee: {
            displayName: 'Employees',
            columns: ['empid', 'full_name', 'email', 'phone', 'role', 'department', 'status', 'basicsalary']
          },
          attendance: {
            displayName: 'Attendance',
            columns: ['attendanceid', 'empid', 'date', 'intime', 'outtime', 'status', 'hours_worked']
          },
          employeeleave: {
            displayName: 'Leave Requests',
            columns: ['leaveid', 'empid', 'leavetype', 'leavefromdate', 'leavetodate', 'duration', 'leavestatus']
          },
          loanrequest: {
            displayName: 'Loan Requests',
            columns: ['loanrequestid', 'empid', 'loantype', 'amount', 'duration', 'status', 'date']
          },
          employee_feedback: {
            displayName: 'Employee Feedback',
            columns: ['id', 'empid', 'feedback_type', 'subject', 'rating', 'status', 'submitted_at']
          },
          departments: {
            displayName: 'Departments',
            columns: ['departmentid', 'departmentname', 'description', 'manager_id', 'is_active']
          },
          salary: {
            displayName: 'Salary Records',
            columns: ['salaryid', 'empid', 'basicsalary', 'totalsalary', 'net_salary', 'salarydate']
          }
        }
      };

      const results = {};

      // Generate PDF if requested
      if (reportType === 'both' || reportType === 'pdf') {
        results.pdf = await reportGenerator.generatePDF(tableName, data, reportConfig);
      }

      // Generate Excel if requested
      if (reportType === 'both' || reportType === 'excel') {
        results.excel = await reportGenerator.generateExcel(tableName, data, reportConfig);
      }

      console.log('✅ Comprehensive report generation completed:', results);
      return { success: true, results };

    } catch (error) {
      console.error('💥 Comprehensive report generation failed:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== COMPREHENSIVE REPORT GENERATION COMPLETED =====');
    }
  },

  // Generate Summary Report with Multiple Tables
  generateSummaryReport: async (allData) => {
    console.log('🎬 ===== SUMMARY REPORT GENERATION STARTED =====');
    console.log('📋 Summary Report details:', { tables: Object.keys(allData) });

    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      let yPosition = 15;

      // Title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('EMS System Summary Report', 14, yPosition);
      yPosition += 15;

      // Generation info
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, yPosition);
      yPosition += 10;

      // Summary statistics
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Summary Statistics', 14, yPosition);
      yPosition += 10;

      const stats = Object.keys(allData).map(tableName => ({
        table: tableName,
        count: allData[tableName]?.length || 0
      }));

      // Add summary table
      doc.autoTable({
        head: [['Table', 'Record Count']],
        body: stats.map(stat => [stat.table.replace(/_/g, ' ').toUpperCase(), stat.count]),
        startY: yPosition,
        styles: { fontSize: 10 },
        headStyles: { 
          fillColor: [52, 152, 219],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Generate detailed tables for each dataset
      const tableNames = Object.keys(allData);
      for (let i = 0; i < tableNames.length; i++) {
        const tableName = tableNames[i];
        const data = allData[tableName];

        if (!data || data.length === 0) continue;

        // Add new page for each table after the first
        if (i > 0) {
          doc.addPage();
          yPosition = 15;
        }

        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text(`${tableName.replace(/_/g, ' ').toUpperCase()} (${data.length} records)`, 14, yPosition);
        yPosition += 10;

        const headers = Object.keys(data[0] || {}).slice(0, 6); // Limit columns for summary
        const tableData = data.slice(0, 20).map(row => // Limit rows for summary
          headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '-';
            if (typeof value === 'boolean') return value ? 'Yes' : 'No';
            if (typeof value === 'object' && value instanceof Date) {
              return new Date(value).toLocaleDateString();
            }
            if (typeof value === 'string' && value.includes('T')) {
              return new Date(value).toLocaleDateString();
            }
            return String(value).substring(0, 30); // Limit cell content
          })
        );

        if (tableData.length > 0) {
          doc.autoTable({
            head: [headers.map(h => 
              typeof h === 'string' ? h.replace(/_/g, ' ').toUpperCase() : String(h)
            )],
            body: tableData,
            startY: yPosition,
            styles: { 
              fontSize: 7,
              cellPadding: 2
            },
            headStyles: { 
              fillColor: [41, 128, 185],
              textColor: 255,
              fontStyle: 'bold'
            },
            pageBreak: 'auto',
            margin: { top: yPosition }
          });

          yPosition = doc.lastAutoTable.finalY + 10;
        }
      }

      const fileName = `ems_summary_report_${Date.now()}.pdf`;
      doc.save(fileName);

      console.log('✅ Summary report generated successfully:', fileName);
      return { success: true, fileName };

    } catch (error) {
      console.error('💥 Summary report generation failed:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== SUMMARY REPORT GENERATION COMPLETED =====');
    }
  }
};