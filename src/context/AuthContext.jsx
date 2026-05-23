import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Current session user
  const [user, setUser] = useState(() => {
    const session = localStorage.getItem('pethaven_session');
    return session ? JSON.parse(session) : null;
  });

  // Users database (profiles)
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('pethaven_users');
    const parsed = saved ? JSON.parse(saved) : [];
    // Ensure preloaded admin account exists
    const hasAdmin = parsed.some((u) => u.email === 'admin@pethaven.org');
    if (!hasAdmin) {
      const defaultAdmin = {
        id: 'user-admin',
        name: 'System Administrator',
        email: 'admin@pethaven.org',
        password: 'admin',
        role: 'admin',
        dateJoined: new Date().toISOString()
      };
      const updated = [defaultAdmin, ...parsed];
      localStorage.setItem('pethaven_users', JSON.stringify(updated));
      return updated;
    }
    return parsed;
  });

  // Safe Messaging Inbox database
  const [inboxMessages, setInboxMessages] = useState(() => {
    const saved = localStorage.getItem('pethaven_inbox');
    return saved ? JSON.parse(saved) : [];
  });

  // Reports database
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('pethaven_reports');
    return saved ? JSON.parse(saved) : [];
  });

  // System audit logs
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('pethaven_audit_logs');
    if (saved) return JSON.parse(saved);
    // Preload standard logs
    const initialLogs = [
      { id: 'log-1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), action: 'System Setup', details: 'PetHaven v3 Security Suite initialized.' },
      { id: 'log-2', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), action: 'Database Seed', details: 'Loaded default animal portraits successfully.' }
    ];
    localStorage.setItem('pethaven_audit_logs', JSON.stringify(initialLogs));
    return initialLogs;
  });

  // Sync session
  useEffect(() => {
    if (user) {
      localStorage.setItem('pethaven_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('pethaven_session');
    }
  }, [user]);

  // Sync users database locally (for offline support)
  useEffect(() => {
    localStorage.setItem('pethaven_users', JSON.stringify(users));
  }, [users]);

  // Sync inbox messages locally
  useEffect(() => {
    localStorage.setItem('pethaven_inbox', JSON.stringify(inboxMessages));
  }, [inboxMessages]);

  // Sync reports locally
  useEffect(() => {
    localStorage.setItem('pethaven_reports', JSON.stringify(reports));
  }, [reports]);

  // Sync logs locally
  useEffect(() => {
    localStorage.setItem('pethaven_audit_logs', JSON.stringify(logs));
  }, [logs]);

  // ON MOUNT: Fetch all data from Supabase if active
  useEffect(() => {
    if (!supabase) return;

    const fetchSupabaseData = async () => {
      try {
        // 1. Fetch profiles / users database
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        if (!profilesError && profilesData) {
          const mappedProfiles = profilesData.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            password: u.password,
            role: u.role,
            dateJoined: u.date_joined
          }));

          const hasAdmin = mappedProfiles.some((u) => u.email === 'admin@pethaven.org');
          if (!hasAdmin) {
            const defaultAdmin = {
              id: 'user-admin',
              name: 'System Administrator',
              email: 'admin@pethaven.org',
              password: 'admin',
              role: 'admin',
              date_joined: new Date().toISOString()
            };
            await supabase.from('profiles').insert([defaultAdmin]);
            setUsers([
              {
                id: defaultAdmin.id,
                name: defaultAdmin.name,
                email: defaultAdmin.email,
                password: defaultAdmin.password,
                role: defaultAdmin.role,
                dateJoined: defaultAdmin.date_joined
              },
              ...mappedProfiles
            ]);
          } else {
            setUsers(mappedProfiles);
          }
        }

        // 2. Fetch Adoptions Inbox Inquiries
        const { data: inboxData, error: inboxError } = await supabase
          .from('inbox_messages')
          .select('*')
          .order('timestamp', { ascending: false });
        if (!inboxError && inboxData) {
          const camelInbox = inboxData.map((msg) => ({
            id: msg.id,
            petId: msg.pet_id,
            petName: msg.pet_name,
            ownerId: msg.owner_id,
            adopterName: msg.adopter_name,
            adopterEmail: msg.adopter_email,
            adopterPhone: msg.adopter_phone,
            message: msg.message,
            timestamp: msg.timestamp,
            isRead: msg.is_read
          }));
          setInboxMessages(camelInbox);
        }

        // 3. Fetch Abuse Reports
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('*')
          .order('timestamp', { ascending: false });
        if (!reportsError && reportsData) {
          const camelReports = reportsData.map((rep) => ({
            id: rep.id,
            petId: rep.pet_id,
            petName: rep.pet_name,
            reason: rep.reason,
            details: rep.details,
            reporterEmail: rep.reporter_email,
            timestamp: rep.timestamp
          }));
          setReports(camelReports);
        }

        // 4. Fetch Audit Logs
        const { data: logsData, error: logsError } = await supabase
          .from('audit_logs')
          .select('*')
          .order('timestamp', { ascending: false });
        if (!logsError && logsData) {
          setLogs(logsData);
        }
      } catch (err) {
        console.error('Failed to sync context with Supabase', err);
      }
    };

    fetchSupabaseData();
  }, []);

  // Centralized log writer
  const addLog = async (action, details) => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      details
    };

    if (supabase) {
      try {
        await supabase.from('audit_logs').insert([newLog]);
      } catch (err) {
        console.error('Failed to log in Supabase', err);
      }
    }

    setLogs((prev) => [newLog, ...prev]);
  };

  // Auth Operations
  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        let found = null;
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', email.toLowerCase())
              .single();
            if (!error && data) {
              found = {
                id: data.id,
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                dateJoined: data.date_joined
              };
            }
          } catch (err) {
            console.error(err);
          }
        }
        
        if (!found) {
          found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        }

        if (!found) {
          reject(new Error('No account found with this email address.'));
        } else if (found.password !== password) {
          reject(new Error('Incorrect password. Please try again.'));
        } else {
          setUser(found);
          addLog('User Login', `Session started for ${found.name} (${found.role}).`);
          resolve(found);
        }
      }, 800);
    });
  };

  const register = (name, email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        let exists = false;
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', email.toLowerCase());
            exists = data && data.length > 0;
          } catch (err) {
            console.error(err);
          }
        } else {
          exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
        }

        if (exists) {
          reject(new Error('An account already exists with this email address.'));
        } else {
          const newUser = {
            id: `user-${Date.now()}`,
            name,
            email,
            password,
            role: 'user',
            dateJoined: new Date().toISOString()
          };

          if (supabase) {
            try {
              const dbProfile = {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                role: newUser.role,
                date_joined: newUser.dateJoined
              };
              await supabase.from('profiles').insert([dbProfile]);
            } catch (err) {
              console.error('Failed to insert profile in Supabase', err);
            }
          }

          setUsers((prev) => [newUser, ...prev]);
          setUser(newUser);
          addLog('User Registration', `New user account created: ${name} (${email}).`);
          resolve(newUser);
        }
      }, 800);
    });
  };

  const logout = () => {
    if (user) {
      addLog('User Logout', `Session ended for ${user.name}.`);
    }
    setUser(null);
  };

  // Safe Messaging Operations
  const sendAdoptMessage = (petId, petName, ownerId, adopterName, adopterEmail, adopterPhone, messageText) => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const newMessage = {
          id: `msg-${Date.now()}`,
          petId,
          petName,
          ownerId: ownerId || 'user-admin',
          adopterName,
          adopterEmail,
          adopterPhone,
          message: messageText,
          timestamp: new Date().toISOString(),
          isRead: false
        };

        if (supabase) {
          try {
            const dbMessage = {
              id: newMessage.id,
              pet_id: newMessage.petId,
              pet_name: newMessage.petName,
              owner_id: newMessage.ownerId,
              adopter_name: newMessage.adopterName,
              adopter_email: newMessage.adopterEmail,
              adopter_phone: newMessage.adopterPhone,
              message: newMessage.message,
              timestamp: newMessage.timestamp,
              is_read: newMessage.isRead
            };
            await supabase.from('inbox_messages').insert([dbMessage]);
          } catch (err) {
            console.error('Failed to send message to Supabase', err);
          }
        }

        setInboxMessages((prev) => [newMessage, ...prev]);
        addLog('Adoption Inquiry', `Safe message sent for pet '${petName}' to owner ID '${ownerId || 'admin'}'.`);
        resolve(true);
      }, 1000);
    });
  };

  // Report Listing Operations
  const reportListing = (petId, petName, reason, details, reporterEmail) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const normalizedEmail = reporterEmail.trim().toLowerCase();
        
        // Check duplicate report
        let alreadyReported = false;
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('reports')
              .select('*')
              .eq('pet_id', petId)
              .eq('reporter_email', normalizedEmail);
            alreadyReported = data && data.length > 0;
          } catch (err) {
            console.error(err);
          }
        } else {
          alreadyReported = reports.some(
            (rep) => rep.petId === petId && rep.reporterEmail.trim().toLowerCase() === normalizedEmail
          );
        }
        
        if (alreadyReported) {
          reject(new Error('DUPLICATE_REPORT'));
          return;
        }

        const newReport = {
          id: `rep-${Date.now()}`,
          petId,
          petName,
          reason,
          details,
          reporterEmail: normalizedEmail,
          timestamp: new Date().toISOString()
        };

        let petReportsCount = 0;
        
        if (supabase) {
          try {
            const dbReport = {
              id: newReport.id,
              pet_id: newReport.petId,
              pet_name: newReport.petName,
              reason: newReport.reason,
              details: newReport.details,
              reporter_email: newReport.reporterEmail,
              timestamp: newReport.timestamp
            };
            await supabase.from('reports').insert([dbReport]);

            const { data, error } = await supabase
              .from('reports')
              .select('id')
              .eq('pet_id', petId);
            if (!error && data) {
              petReportsCount = data.length;
            }
          } catch (err) {
            console.error('Failed to report listing in Supabase', err);
          }
        } else {
          const updatedReports = [newReport, ...reports];
          petReportsCount = updatedReports.filter((rep) => rep.petId === petId).length;
        }

        if (petReportsCount >= 10) {
          if (supabase) {
            try {
              await supabase.from('pets').delete().eq('id', petId);
            } catch (err) {
              console.error('Failed to auto-delete pet in Supabase', err);
            }
          }
          
          window.dispatchEvent(new CustomEvent('pethaven_pet_autodeleted', { detail: { petId } }));
          setReports((prev) => prev.filter((rep) => rep.petId !== petId));
          addLog('Auto-Moderator Action', `Listing '${petName}' automatically deleted due to accumulating 10+ abuse reports.`);
        } else {
          setReports((prev) => [newReport, ...prev]);
          addLog('Listing Flagged', `Listing '${petName}' reported for: ${reason} by ${normalizedEmail}.`);
        }
        
        resolve(true);
      }, 800);
    });
  };

  // Backwards compatible wrapper for Inbox updates (Mark as read)
  const updateInboxMessages = (updater) => {
    setInboxMessages((prev) => {
      const nextMessages = typeof updater === 'function' ? updater(prev) : updater;
      
      if (supabase) {
        nextMessages.forEach(async (msg) => {
          const oldMsg = prev.find((m) => m.id === msg.id);
          if (oldMsg && !oldMsg.isRead && msg.isRead) {
            try {
              await supabase
                .from('inbox_messages')
                .update({ is_read: true })
                .eq('id', msg.id);
            } catch (err) {
              console.error('Failed to mark message read in Supabase', err);
            }
          }
        });
      }
      return nextMessages;
    });
  };

  // Backwards compatible wrapper for reports (Admin dismissal)
  const updateReports = (updater) => {
    setReports((prev) => {
      const nextReports = typeof updater === 'function' ? updater(prev) : updater;
      
      if (supabase) {
        const deletedReports = prev.filter((r) => !nextReports.some((nr) => nr.id === r.id));
        deletedReports.forEach(async (rep) => {
          try {
            await supabase.from('reports').delete().eq('id', rep.id);
          } catch (err) {
            console.error('Failed to delete report in Supabase', err);
          }
        });
      }
      return nextReports;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        inboxMessages,
        reports,
        logs,
        login,
        register,
        logout,
        sendAdoptMessage,
        reportListing,
        addLog,
        setReports: updateReports,
        setInboxMessages: updateInboxMessages
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
