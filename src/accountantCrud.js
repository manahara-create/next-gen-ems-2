import { supabase } from './supabase';

// Accountant CRUD operations with comprehensive logging
export const accountantCrud = {
  // GET financial records
  getAll: async (table, columns = '*', filters = {}) => {
    console.log('🎬 ===== ACCOUNTANT GET ALL OPERATION STARTED =====');
    console.log('📋 Accountant Get All details:', { table, columns, filters });

    try {
      let query = supabase.from(table).select(columns);

      // Apply filters if provided
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          query = query.eq(key, filters[key]);
        }
      });

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Accountant Get All operation failed:', error);
        throw error;
      }

      console.log('✅ Accountant Get All operation successful');
      console.log('📦 Retrieved data count:', data?.length);
      return { success: true, data, count };

    } catch (error) {
      console.error('💥 Accountant Get All operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== ACCOUNTANT GET ALL OPERATION COMPLETED =====');
    }
  },

  // CREATE financial record with accountant logging
  create: async (table, data, accountantId) => {
    console.log('🎬 ===== ACCOUNTANT CREATE OPERATION STARTED =====');
    console.log('📋 Accountant Create details:', { table, data, accountantId });

    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([{ 
          ...data, 
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error('❌ Accountant Create operation failed:', error);
        throw error;
      }

      console.log('✅ Accountant Create operation successful');
      console.log('📦 Created data:', result);
      
      // Log the operation in accountant_operations
      await accountantCrud.create('accountant_operations', {
        operation: 'CREATE',
        record_id: result[0]?.id || result[0]?.salaryid || result[0]?.bonusid,
        accountant_id: accountantId,
        details: JSON.stringify({
          table: table,
          data: data,
          result: result[0]
        }),
        email: data.email || 'accountant@system',
        operation_time: new Date().toISOString()
      });

      return { success: true, data: result };

    } catch (error) {
      console.error('💥 Accountant Create operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== ACCOUNTANT CREATE OPERATION COMPLETED =====');
    }
  },

  // UPDATE financial record with accountant logging
  update: async (table, recordId, updates, accountantId, idColumn = 'id') => {
    console.log('🎬 ===== ACCOUNTANT UPDATE OPERATION STARTED =====');
    console.log('📋 Accountant Update details:', { table, recordId, updates, accountantId, idColumn });

    try {
      // First get old values for audit
      const { data: oldData } = await supabase
        .from(table)
        .select('*')
        .eq(idColumn, recordId)
        .single();

      const { data, error } = await supabase
        .from(table)
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq(idColumn, recordId)
        .select();

      if (error) {
        console.error('❌ Accountant Update operation failed:', error);
        throw error;
      }

      console.log('✅ Accountant Update operation successful');
      console.log('📦 Updated data:', data);

      // Log the operation in accountant_operations
      await accountantCrud.create('accountant_operations', {
        operation: 'UPDATE',
        record_id: recordId,
        accountant_id: accountantId,
        details: JSON.stringify({
          table: table,
          old_data: oldData,
          new_data: updates,
          result: data[0]
        }),
        email: updates.email || 'accountant@system',
        operation_time: new Date().toISOString()
      });

      return { success: true, data };

    } catch (error) {
      console.error('💥 Accountant Update operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== ACCOUNTANT UPDATE OPERATION COMPLETED =====');
    }
  },

  // DELETE financial record with accountant logging
  delete: async (table, recordId, accountantId, idColumn = 'id') => {
    console.log('🎬 ===== ACCOUNTANT DELETE OPERATION STARTED =====');
    console.log('📋 Accountant Delete details:', { table, recordId, accountantId, idColumn });

    try {
      // First get old values for audit
      const { data: oldData } = await supabase
        .from(table)
        .select('*')
        .eq(idColumn, recordId)
        .single();

      const { error } = await supabase
        .from(table)
        .delete()
        .eq(idColumn, recordId);

      if (error) {
        console.error('❌ Accountant Delete operation failed:', error);
        throw error;
      }

      console.log('✅ Accountant Delete operation successful');

      // Log the operation in accountant_operations
      await accountantCrud.create('accountant_operations', {
        operation: 'DELETE',
        record_id: recordId,
        accountant_id: accountantId,
        details: JSON.stringify({
          table: table,
          deleted_data: oldData
        }),
        email: 'accountant@system',
        operation_time: new Date().toISOString()
      });

      return { success: true };

    } catch (error) {
      console.error('💥 Accountant Delete operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== ACCOUNTANT DELETE OPERATION COMPLETED =====');
    }
  },

  // Accountant-specific: Process salary
  processSalary: async (salaryData, accountantId) => {
    console.log('🎬 ===== ACCOUNTANT PROCESS SALARY STARTED =====');
    
    try {
      const result = await accountantCrud.create('salary', salaryData, accountantId);
      
      if (result.success) {
        console.log('✅ Salary processed successfully');
        
        // Update employee salary record if needed
        await supabase
          .from('employee')
          .update({ basicsalary: salaryData.basicsalary })
          .eq('empid', salaryData.empid);
      }

      return result;

    } catch (error) {
      console.error('💥 Process salary failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== ACCOUNTANT PROCESS SALARY COMPLETED =====');
    }
  },

  // Accountant-specific: Generate financial report
  generateFinancialReport: async (quarterData, accountantId) => {
    console.log('🎬 ===== ACCOUNTANT GENERATE FINANCIAL REPORT STARTED =====');
    
    try {
      const result = await accountantCrud.create('financialreports', quarterData, accountantId);
      
      if (result.success) {
        console.log('✅ Financial report generated successfully');
      }

      return result;

    } catch (error) {
      console.error('💥 Generate financial report failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== ACCOUNTANT GENERATE FINANCIAL REPORT COMPLETED =====');
    }
  },

  // Accountant-specific: Process EPF/ETF
  processEPFETF: async (contributionData, accountantId) => {
    console.log('🎬 ===== ACCOUNTANT PROCESS EPF/ETF STARTED =====');
    
    try {
      const { type, ...data } = contributionData;
      let result;

      if (type === 'EPF') {
        result = await accountantCrud.create('epf_contributions', data, accountantId);
      } else if (type === 'ETF') {
        result = await accountantCrud.create('etf_contributions', data, accountantId);
      }

      if (result?.success) {
        console.log('✅ EPF/ETF processed successfully');
      }

      return result || { success: false, error: 'Invalid contribution type' };

    } catch (error) {
      console.error('💥 Process EPF/ETF failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== ACCOUNTANT PROCESS EPF/ETF COMPLETED =====');
    }
  },

  // Accountant-specific: Calculate payroll summary
  getPayrollSummary: async (month) => {
    console.log('🎬 ===== ACCOUNTANT GET PAYROLL SUMMARY STARTED =====');
    
    try {
      const [
        salaries,
        bonuses,
        overtime,
        epfContributions,
        etfContributions
      ] = await Promise.all([
        accountantCrud.getAll('salary', '*', { month }),
        accountantCrud.getAll('bonus', '*', { month }),
        accountantCrud.getAll('ot', '*', { month }),
        accountantCrud.getAll('epf_contributions', '*', { month }),
        accountantCrud.getAll('etf_contributions', '*', { month })
      ]);

      const summary = {
        totalSalaries: salaries.data?.reduce((sum, item) => sum + (item.totalsalary || 0), 0) || 0,
        totalBonuses: bonuses.data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0,
        totalOvertime: overtime.data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0,
        totalEPF: epfContributions.data?.reduce((sum, item) => sum + (item.totalcontribution || 0), 0) || 0,
        totalETF: etfContributions.data?.reduce((sum, item) => sum + (item.employercontribution || 0), 0) || 0,
        employeeCount: salaries.data?.length || 0
      };

      console.log('✅ Payroll summary calculated successfully');
      return { success: true, data: summary };

    } catch (error) {
      console.error('💥 Get payroll summary failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== ACCOUNTANT GET PAYROLL SUMMARY COMPLETED =====');
    }
  }
};

// Accountant table configurations
export const accountantTableConfigs = {
  salary: {
    displayName: 'Salary Records',
    columns: ['salaryid', 'empid', 'basicsalary', 'otpay', 'bonuspay', 'totalsalary', 'salarydate', 'processed_by'],
    formFields: [
      { name: 'empid', label: 'Employee ID', type: 'text', required: true },
      { name: 'basicsalary', label: 'Basic Salary', type: 'number', required: true },
      { name: 'otpay', label: 'OT Pay', type: 'number' },
      { name: 'bonuspay', label: 'Bonus Pay', type: 'number' },
      { name: 'totalsalary', label: 'Total Salary', type: 'number', required: true },
      { name: 'salarydate', label: 'Salary Date', type: 'date', required: true },
      { name: 'processed_by', label: 'Processed By', type: 'text' }
    ]
  },
  bonus: {
    displayName: 'Bonus Records',
    columns: ['bonusid', 'empid', 'type', 'reason', 'amount', 'bonusdate', 'processedby'],
    formFields: [
      { name: 'empid', label: 'Employee ID', type: 'text', required: true },
      { name: 'type', label: 'Bonus Type', type: 'select', options: ['performance', 'festival', 'annual', 'special'] },
      { name: 'reason', label: 'Reason', type: 'textarea' },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'bonusdate', label: 'Bonus Date', type: 'date', required: true },
      { name: 'processedby', label: 'Processed By', type: 'text' }
    ]
  },
  ot: {
    displayName: 'Overtime Records',
    columns: ['otid', 'empid', 'othours', 'rate', 'amount', 'type', 'status', 'processed_by'],
    formFields: [
      { name: 'empid', label: 'Employee ID', type: 'text', required: true },
      { name: 'othours', label: 'OT Hours', type: 'number', required: true },
      { name: 'rate', label: 'Rate', type: 'number', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'type', label: 'Type', type: 'select', options: ['regular', 'holiday', 'weekend'] },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'paid'] }
    ]
  },
  epf_contributions: {
    displayName: 'EPF Contributions',
    columns: ['id', 'empid', 'basicsalary', 'employeecontribution', 'employercontribution', 'totalcontribution', 'month', 'status'],
    formFields: [
      { name: 'empid', label: 'Employee ID', type: 'text', required: true },
      { name: 'basicsalary', label: 'Basic Salary', type: 'number', required: true },
      { name: 'employeecontribution', label: 'Employee Contribution', type: 'number', required: true },
      { name: 'employercontribution', label: 'Employer Contribution', type: 'number', required: true },
      { name: 'totalcontribution', label: 'Total Contribution', type: 'number', required: true },
      { name: 'month', label: 'Month', type: 'date', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'processed', 'paid'] }
    ]
  },
  etf_contributions: {
    displayName: 'ETF Contributions',
    columns: ['id', 'empid', 'basicsalary', 'employercontribution', 'month', 'status'],
    formFields: [
      { name: 'empid', label: 'Employee ID', type: 'text', required: true },
      { name: 'basicsalary', label: 'Basic Salary', type: 'number', required: true },
      { name: 'employercontribution', label: 'Employer Contribution', type: 'number', required: true },
      { name: 'month', label: 'Month', type: 'date', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'processed', 'paid'] }
    ]
  },
  financialreports: {
    displayName: 'Financial Reports',
    columns: ['reportid', 'quarterenddate', 'totalrevenue', 'totalsalarycost', 'totalepfcost', 'totaletfcost', 'netprofit', 'generated_by'],
    formFields: [
      { name: 'quarterenddate', label: 'Quarter End Date', type: 'date', required: true },
      { name: 'totalrevenue', label: 'Total Revenue', type: 'number', required: true },
      { name: 'totalsalarycost', label: 'Total Salary Cost', type: 'number', required: true },
      { name: 'totalepfcost', label: 'Total EPF Cost', type: 'number', required: true },
      { name: 'totaletfcost', label: 'Total ETF Cost', type: 'number', required: true },
      { name: 'totalbonuscost', label: 'Total Bonus Cost', type: 'number' },
      { name: 'totalotcost', label: 'Total OT Cost', type: 'number' },
      { name: 'netprofit', label: 'Net Profit', type: 'number', required: true },
      { name: 'generated_by', label: 'Generated By', type: 'text' }
    ]
  },
  loanrequest: {
    displayName: 'Loan Requests',
    columns: ['loanrequestid', 'empid', 'loantype', 'amount', 'duration', 'interestrate', 'status', 'processedby'],
    formFields: [
      { name: 'empid', label: 'Employee ID', type: 'text', required: true },
      { name: 'loantype', label: 'Loan Type', type: 'select', options: ['personal', 'housing', 'vehicle', 'education'] },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'duration', label: 'Duration (months)', type: 'number', required: true },
      { name: 'interestrate', label: 'Interest Rate', type: 'number', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'rejected'] },
      { name: 'processedby', label: 'Processed By', type: 'text' }
    ]
  }
};