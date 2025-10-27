import { supabase } from './supabase';

// Generic CRUD operations with dual strategy (empid -> email)
export const employeeCrud = {
  // CREATE operation
  create: async (table, data) => {
    console.log('🎬 ===== CREATE OPERATION STARTED =====');
    console.log('📋 Create details:', { table, data });

    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([{ ...data, created_at: new Date().toISOString() }])
        .select();

      if (error) {
        console.error('❌ Create operation failed:', error);
        throw error;
      }

      console.log('✅ Create operation successful');
      console.log('📦 Created data:', result);
      return { success: true, data: result };

    } catch (error) {
      console.error('💥 Create operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== CREATE OPERATION COMPLETED =====');
    }
  },

  // READ operation
  read: async (table, empid, email, columns = '*') => {
    console.log('🎬 ===== READ OPERATION STARTED =====');
    console.log('📋 Read details:', { table, empid, email, columns });

    try {
      // First attempt: Try with empid
      if (empid) {
        console.log('🔄 Attempt 1: Reading with empid...');
        const { data, error } = await supabase
          .from(table)
          .select(columns)
          .eq('empid', empid);

        if (!error && data && data.length > 0) {
          console.log('✅ Read successful with empid');
          console.log('📦 Retrieved data:', data);
          return { success: true, data };
        }
        console.log('⚠️ No data found with empid, trying email...');
      }

      // Second attempt: Try with email
      if (email) {
        console.log('🔄 Attempt 2: Reading with email...');
        const { data, error } = await supabase
          .from(table)
          .select(columns)
          .eq('email', email);

        if (error) {
          console.error('❌ Read with email failed:', error);
          throw error;
        }

        console.log('✅ Read successful with email');
        console.log('📦 Retrieved data:', data);
        return { success: true, data };
      }

      throw new Error('Neither empid nor email provided');

    } catch (error) {
      console.error('💥 Read operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== READ OPERATION COMPLETED =====');
    }
  },

  // UPDATE operation
  update: async (table, empid, email, updates) => {
    console.log('🎬 ===== UPDATE OPERATION STARTED =====');
    console.log('📋 Update details:', { table, empid, email, updates });

    try {
      // First attempt: Try with empid
      if (empid) {
        console.log('🔄 Attempt 1: Updating with empid...');
        const { data, error } = await supabase
          .from(table)
          .update({ 
            ...updates, 
            updated_at: new Date().toISOString() 
          })
          .eq('empid', empid)
          .select();

        if (!error) {
          console.log('✅ Update successful with empid');
          console.log('📦 Updated data:', data);
          return { success: true, data };
        }
        console.log('⚠️ Update with empid failed, trying email...');
      }

      // Second attempt: Try with email
      if (email) {
        console.log('🔄 Attempt 2: Updating with email...');
        const { data, error } = await supabase
          .from(table)
          .update({ 
            ...updates, 
            updated_at: new Date().toISOString() 
          })
          .eq('email', email)
          .select();

        if (error) {
          console.error('❌ Update with email failed:', error);
          throw error;
        }

        console.log('✅ Update successful with email');
        console.log('📦 Updated data:', data);
        return { success: true, data };
      }

      throw new Error('Neither empid nor email provided');

    } catch (error) {
      console.error('💥 Update operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== UPDATE OPERATION COMPLETED =====');
    }
  },

  // DELETE operation
  delete: async (table, empid, email) => {
    console.log('🎬 ===== DELETE OPERATION STARTED =====');
    console.log('📋 Delete details:', { table, empid, email });

    try {
      // First attempt: Try with empid
      if (empid) {
        console.log('🔄 Attempt 1: Deleting with empid...');
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('empid', empid);

        if (!error) {
          console.log('✅ Delete successful with empid');
          return { success: true };
        }
        console.log('⚠️ Delete with empid failed, trying email...');
      }

      // Second attempt: Try with email
      if (email) {
        console.log('🔄 Attempt 2: Deleting with email...');
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('email', email);

        if (error) {
          console.error('❌ Delete with email failed:', error);
          throw error;
        }

        console.log('✅ Delete successful with email');
        return { success: true };
      }

      throw new Error('Neither empid nor email provided');

    } catch (error) {
      console.error('💥 Delete operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== DELETE OPERATION COMPLETED =====');
    }
  },

  // READ ALL records for employee
  readAll: async (table, empid, email, columns = '*') => {
    console.log('🎬 ===== READ ALL OPERATION STARTED =====');
    console.log('📋 Read All details:', { table, empid, email, columns });

    try {
      let query = supabase.from(table).select(columns);

      // Try both conditions with OR
      if (empid && email) {
        query = query.or(`empid.eq.${empid},email.eq.${email}`);
      } else if (empid) {
        query = query.eq('empid', empid);
      } else if (email) {
        query = query.eq('email', email);
      } else {
        throw new Error('Neither empid nor email provided');
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Read All operation failed:', error);
        throw error;
      }

      console.log('✅ Read All operation successful');
      console.log('📦 Retrieved data:', data);
      return { success: true, data };

    } catch (error) {
      console.error('💥 Read All operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== READ ALL OPERATION COMPLETED =====');
    }
  }
};