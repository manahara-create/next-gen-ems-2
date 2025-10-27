import { supabase } from './supabase';

// Admin CRUD operations with comprehensive logging
export const adminCrud = {
  // GET ALL records from any table
  getAll: async (table, columns = '*', filters = {}) => {
    console.log('🎬 ===== ADMIN GET ALL OPERATION STARTED =====');
    console.log('📋 Get All details:', { table, columns, filters });

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
        console.error('❌ Get All operation failed:', error);
        throw error;
      }

      console.log('✅ Get All operation successful');
      console.log('📦 Retrieved data count:', data?.length);
      return { success: true, data, count };

    } catch (error) {
      console.error('💥 Get All operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== ADMIN GET ALL OPERATION COMPLETED =====');
    }
  },

  // CREATE record in any table
  create: async (table, data) => {
    console.log('🎬 ===== ADMIN CREATE OPERATION STARTED =====');
    console.log('📋 Create details:', { table, data });

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
        console.error('❌ Create operation failed:', error);
        throw error;
      }

      console.log('✅ Create operation successful');
      console.log('📦 Created data:', result);
      
      // Log the operation in audit_logs
      await adminCrud.create('audit_logs', {
        action: 'CREATE',
        table_name: table,
        recordid: result[0]?.id || result[0]?.empid || result[0]?.attendanceid,
        new_value: JSON.stringify(data),
        email: data.email || 'admin@system',
        ip_address: 'system',
        user_agent: 'admin-dashboard'
      });

      return { success: true, data: result };

    } catch (error) {
      console.error('💥 Create operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== ADMIN CREATE OPERATION COMPLETED =====');
    }
  },

  // UPDATE record in any table
  update: async (table, recordId, updates, idColumn = 'id') => {
    console.log('🎬 ===== ADMIN UPDATE OPERATION STARTED =====');
    console.log('📋 Update details:', { table, recordId, updates, idColumn });

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
        console.error('❌ Update operation failed:', error);
        throw error;
      }

      console.log('✅ Update operation successful');
      console.log('📦 Updated data:', data);

      // Log the operation in audit_logs
      await adminCrud.create('audit_logs', {
        action: 'UPDATE',
        table_name: table,
        recordid: recordId,
        old_value: JSON.stringify(oldData),
        new_value: JSON.stringify(updates),
        email: updates.email || 'admin@system',
        ip_address: 'system',
        user_agent: 'admin-dashboard'
      });

      return { success: true, data };

    } catch (error) {
      console.error('💥 Update operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== ADMIN UPDATE OPERATION COMPLETED =====');
    }
  },

  // DELETE record from any table
  delete: async (table, recordId, idColumn = 'id') => {
    console.log('🎬 ===== ADMIN DELETE OPERATION STARTED =====');
    console.log('📋 Delete details:', { table, recordId, idColumn });

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
        console.error('❌ Delete operation failed:', error);
        throw error;
      }

      console.log('✅ Delete operation successful');

      // Log the operation in audit_logs
      await adminCrud.create('audit_logs', {
        action: 'DELETE',
        table_name: table,
        recordid: recordId,
        old_value: JSON.stringify(oldData),
        email: 'admin@system',
        ip_address: 'system',
        user_agent: 'admin-dashboard'
      });

      return { success: true };

    } catch (error) {
      console.error('💥 Delete operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== ADMIN DELETE OPERATION COMPLETED =====');
    }
  },

  // GENERATE REPORT
  generateReport: async (reportConfig) => {
    console.log('🎬 ===== REPORT GENERATION STARTED =====');
    console.log('📋 Report configuration:', reportConfig);

    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([{
          name: reportConfig.name,
          type: reportConfig.type,
          format: reportConfig.format,
          config: reportConfig,
          status: 'completed',
          report_date: new Date().toISOString(),
          email: reportConfig.email || 'admin@system'
        }])
        .select();

      if (error) {
        console.error('❌ Report generation failed:', error);
        throw error;
      }

      console.log('✅ Report generated successfully');
      return { success: true, data };

    } catch (error) {
      console.error('💥 Report generation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== REPORT GENERATION COMPLETED =====');
    }
  }
};

// Table configuration for dynamic forms
export const tableConfigs = {
  employee: {
    displayName: 'Employees',
    columns: ['empid', 'full_name', 'email', 'phone', 'role', 'department', 'status', 'basicsalary'],
    formFields: [
      { name: 'full_name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'role', label: 'Role', type: 'select', options: ['admin', 'manager', 'employee', 'hr', 'accountant', 'ceo'] },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
      { name: 'basicsalary', label: 'Basic Salary', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] }
    ]
  },
  attendance: {
    displayName: 'Attendance',
    columns: ['attendanceid', 'empid', 'date', 'intime', 'outtime', 'status', 'hours_worked'],
    formFields: [
      { name: 'empid', label: 'Employee ID', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'intime', label: 'In Time', type: 'time' },
      { name: 'outtime', label: 'Out Time', type: 'time' },
      { name: 'status', label: 'Status', type: 'select', options: ['present', 'absent', 'late', 'half-day'] },
      { name: 'hours_worked', label: 'Hours Worked', type: 'number' }
    ]
  },
  employeeleave: {
    displayName: 'Leave Requests',
    columns: ['leaveid', 'empid', 'leavetype', 'leavefromdate', 'leavetodate', 'duration', 'leavestatus'],
    formFields: [
      { name: 'empid', label: 'Employee ID', type: 'text', required: true },
      { name: 'leavetype', label: 'Leave Type', type: 'select', options: ['sick', 'casual', 'annual', 'emergency'] },
      { name: 'leavefromdate', label: 'From Date', type: 'date', required: true },
      { name: 'leavetodate', label: 'To Date', type: 'date', required: true },
      { name: 'duration', label: 'Duration', type: 'number' },
      { name: 'leavestatus', label: 'Status', type: 'select', options: ['pending', 'approved', 'rejected'] }
    ]
  },
  loanrequest: {
    displayName: 'Loan Requests',
    columns: ['loanrequestid', 'empid', 'loantype', 'amount', 'duration', 'status', 'date'],
    formFields: [
      { name: 'empid', label: 'Employee ID', type: 'text', required: true },
      { name: 'loantype', label: 'Loan Type', type: 'select', options: ['personal', 'emergency', 'housing'] },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'duration', label: 'Duration (months)', type: 'number', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'rejected'] }
    ]
  },
  employee_feedback: {
    displayName: 'Employee Feedback',
    columns: ['id', 'empid', 'feedback_type', 'subject', 'rating', 'status'],
    formFields: [
      { name: 'empid', label: 'Employee ID', type: 'text', required: true },
      { name: 'feedback_type', label: 'Feedback Type', type: 'select', options: ['general', 'suggestion', 'complaint', 'appreciation'] },
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'rating', label: 'Rating', type: 'number', min: 1, max: 5 },
      { name: 'status', label: 'Status', type: 'select', options: ['submitted', 'reviewed', 'responded'] }
    ]
  },
  departments: {
    displayName: 'Departments',
    columns: ['departmentid', 'departmentname', 'description', 'manager_id', 'is_active'],
    formFields: [
      { name: 'departmentname', label: 'Department Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'manager_id', label: 'Manager ID', type: 'text' },
      { name: 'is_active', label: 'Active', type: 'switch' }
    ]
  },
  salary: {
    displayName: 'Salary Records',
    columns: ['salaryid', 'empid', 'basicsalary', 'totalsalary', 'net_salary', 'salarydate'],
    formFields: [
      { name: 'empid', label: 'Employee ID', type: 'text', required: true },
      { name: 'basicsalary', label: 'Basic Salary', type: 'number', required: true },
      { name: 'totalsalary', label: 'Total Salary', type: 'number' },
      { name: 'net_salary', label: 'Net Salary', type: 'number' },
      { name: 'salarydate', label: 'Salary Date', type: 'date', required: true }
    ]
  }
};