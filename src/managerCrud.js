import { supabase } from './supabase';

// Manager CRUD operations with comprehensive logging
export const managerCrud = {
  // GET records with manager-specific access
  getAll: async (table, columns = '*', filters = {}, managerId = null) => {
    console.log('🎬 ===== MANAGER GET ALL OPERATION STARTED =====');
    console.log('📋 Manager Get All details:', { table, columns, filters, managerId });

    try {
      let query = supabase.from(table).select(columns);

      // Apply filters if provided
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          query = query.eq(key, filters[key]);
        }
      });

      // Manager-specific filtering for employee data
      if (table === 'employee' && managerId) {
        query = query.eq('managerid', managerId);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Manager Get All operation failed:', error);
        throw error;
      }

      console.log('✅ Manager Get All operation successful');
      console.log('📦 Retrieved data count:', data?.length);
      return { success: true, data, count };

    } catch (error) {
      console.error('💥 Manager Get All operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== MANAGER GET ALL OPERATION COMPLETED =====');
    }
  },

  // CREATE record with manager logging
  create: async (table, data, managerId) => {
    console.log('🎬 ===== MANAGER CREATE OPERATION STARTED =====');
    console.log('📋 Manager Create details:', { table, data, managerId });

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
        console.error('❌ Manager Create operation failed:', error);
        throw error;
      }

      console.log('✅ Manager Create operation successful');
      console.log('📦 Created data:', result);
      
      // Log the operation in manager_operations
      await managerCrud.create('manager_operations', {
        operation: 'CREATE',
        record_id: result[0]?.id || result[0]?.empid || result[0]?.attendanceid,
        manager_id: managerId,
        details: JSON.stringify({
          table: table,
          data: data,
          result: result[0]
        }),
        email: data.email || 'manager@system',
        operation_time: new Date().toISOString()
      });

      return { success: true, data: result };

    } catch (error) {
      console.error('💥 Manager Create operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== MANAGER CREATE OPERATION COMPLETED =====');
    }
  },

  // UPDATE record with manager logging
  update: async (table, recordId, updates, managerId, idColumn = 'id') => {
    console.log('🎬 ===== MANAGER UPDATE OPERATION STARTED =====');
    console.log('📋 Manager Update details:', { table, recordId, updates, managerId, idColumn });

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
        console.error('❌ Manager Update operation failed:', error);
        throw error;
      }

      console.log('✅ Manager Update operation successful');
      console.log('📦 Updated data:', data);

      // Log the operation in manager_operations
      await managerCrud.create('manager_operations', {
        operation: 'UPDATE',
        record_id: recordId,
        manager_id: managerId,
        details: JSON.stringify({
          table: table,
          old_data: oldData,
          new_data: updates,
          result: data[0]
        }),
        email: updates.email || 'manager@system',
        operation_time: new Date().toISOString()
      });

      return { success: true, data };

    } catch (error) {
      console.error('💥 Manager Update operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== MANAGER UPDATE OPERATION COMPLETED =====');
    }
  },

  // DELETE record with manager logging
  delete: async (table, recordId, managerId, idColumn = 'id') => {
    console.log('🎬 ===== MANAGER DELETE OPERATION STARTED =====');
    console.log('📋 Manager Delete details:', { table, recordId, managerId, idColumn });

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
        console.error('❌ Manager Delete operation failed:', error);
        throw error;
      }

      console.log('✅ Manager Delete operation successful');

      // Log the operation in manager_operations
      await managerCrud.create('manager_operations', {
        operation: 'DELETE',
        record_id: recordId,
        manager_id: managerId,
        details: JSON.stringify({
          table: table,
          deleted_data: oldData
        }),
        email: 'manager@system',
        operation_time: new Date().toISOString()
      });

      return { success: true };

    } catch (error) {
      console.error('💥 Manager Delete operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== MANAGER DELETE OPERATION COMPLETED =====');
    }
  },

  // Manager-specific: Get team members
  getTeamMembers: async (managerId) => {
    console.log('🎬 ===== MANAGER GET TEAM MEMBERS STARTED =====');
    
    try {
      const { data, error } = await supabase
        .from('employee')
        .select('*')
        .eq('managerid', managerId)
        .eq('status', 'Active');

      if (error) {
        console.error('❌ Get team members failed:', error);
        throw error;
      }

      console.log('✅ Team members retrieved successfully');
      return { success: true, data };

    } catch (error) {
      console.error('💥 Get team members failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== MANAGER GET TEAM MEMBERS COMPLETED =====');
    }
  },

  // Manager-specific: Approve/Reject leave requests
  processLeaveRequest: async (leaveId, status, remarks, managerId) => {
    console.log('🎬 ===== MANAGER PROCESS LEAVE REQUEST STARTED =====');
    
    try {
      const { data, error } = await supabase
        .from('employeeleave')
        .update({ 
          leavestatus: status,
          remarks: remarks,
          approvedby: managerId,
          updated_at: new Date().toISOString()
        })
        .eq('leaveid', leaveId)
        .select();

      if (error) {
        console.error('❌ Process leave request failed:', error);
        throw error;
      }

      // Log the operation
      await managerCrud.create('manager_operations', {
        operation: 'LEAVE_PROCESS',
        record_id: leaveId,
        manager_id: managerId,
        details: JSON.stringify({
          action: status,
          remarks: remarks,
          leave_data: data[0]
        }),
        email: 'manager@system',
        operation_time: new Date().toISOString()
      });

      console.log('✅ Leave request processed successfully');
      return { success: true, data };

    } catch (error) {
      console.error('💥 Process leave request failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== MANAGER PROCESS LEAVE REQUEST COMPLETED =====');
    }
  }
};

// Manager table configurations
export const managerTableConfigs = {
  employee: {
    displayName: 'Team Members',
    columns: ['empid', 'full_name', 'email', 'phone', 'role', 'department', 'status', 'basicsalary'],
    formFields: [
      { name: 'full_name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'role', label: 'Role', type: 'select', options: ['employee', 'team_lead'] },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
      { name: 'basicsalary', label: 'Basic Salary', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] }
    ]
  },
  attendance: {
    displayName: 'Team Attendance',
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
    displayName: 'Team Leave Requests',
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
  tasks: {
    displayName: 'Team Tasks',
    columns: ['id', 'title', 'description', 'priority', 'status', 'due_date', 'assignee_id'],
    formFields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'] },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'completed'] },
      { name: 'due_date', label: 'Due Date', type: 'date' },
      { name: 'assignee_id', label: 'Assignee ID', type: 'text', required: true }
    ]
  },
  performance_rating: {
    displayName: 'Performance Ratings',
    columns: ['ratingid', 'empid', 'rating', 'comments', 'rating_date'],
    formFields: [
      { name: 'empid', label: 'Employee ID', type: 'text', required: true },
      { name: 'rating', label: 'Rating', type: 'number', min: 1, max: 5, required: true },
      { name: 'comments', label: 'Comments', type: 'textarea' },
      { name: 'rating_date', label: 'Rating Date', type: 'date', required: true }
    ]
  }
};