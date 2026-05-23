import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Current session user
  const [user, setUser] = useState(() => {
    const session = localStorage.getItem('pethaven_session');
    return session ? JSON.parse(session) : null;
  });

  // Users database
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
        password: 'admin', // Simple cleartext password for local testing
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

  // Sync users database
  useEffect(() => {
    localStorage.setItem('pethaven_users', JSON.stringify(users));
  }, [users]);

  // Sync inbox messages
  useEffect(() => {
    localStorage.setItem('pethaven_inbox', JSON.stringify(inboxMessages));
  }, [inboxMessages]);

  // Sync reports
  useEffect(() => {
    localStorage.setItem('pethaven_reports', JSON.stringify(reports));
  }, [reports]);

  // Sync logs
  useEffect(() => {
    localStorage.setItem('pethaven_audit_logs', JSON.stringify(logs));
  }, [logs]);

  // Add system audit log helper
  const addLog = (action, details) => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      details
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Auth Operations
  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      // Simulate API lag for rich UI experience
      setTimeout(() => {
        const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
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
      setTimeout(() => {
        const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
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
      setTimeout(() => {
        const newMessage = {
          id: `msg-${Date.now()}`,
          petId,
          petName,
          ownerId: ownerId || 'user-admin', // Default to admin if unowned
          adopterName,
          adopterEmail,
          adopterPhone,
          message: messageText,
          timestamp: new Date().toISOString(),
          isRead: false
        };
        setInboxMessages((prev) => [newMessage, ...prev]);
        addLog('Adoption Inquiry', `Safe message sent for pet '${petName}' to owner ID '${ownerId || 'admin'}'.`);
        resolve(true);
      }, 1000);
    });
  };

  // Report Listing Operations
  const reportListing = (petId, petName, reason, details, reporterEmail) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalizedEmail = reporterEmail.trim().toLowerCase();
        
        // Check if this email already reported this listing
        const alreadyReported = reports.some(
          (rep) => rep.petId === petId && rep.reporterEmail.trim().toLowerCase() === normalizedEmail
        );
        
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
          timestamp: new Date().toISOString(),
          status: 'pending'
        };

        const updatedReports = [newReport, ...reports];
        
        // Count total reports for this pet ID
        const petReportsCount = updatedReports.filter((rep) => rep.petId === petId).length;
        
        if (petReportsCount >= 10) {
          // Trigger a custom event to notify AppContent to update state
          window.dispatchEvent(new CustomEvent('pethaven_pet_autodeleted', { detail: { petId } }));
          
          // Clear all reports for this auto-deleted pet listing
          const filteredReports = updatedReports.filter((rep) => rep.petId !== petId);
          setReports(filteredReports);
          
          addLog('Auto-Moderator Action', `Listing '${petName}' automatically deleted due to accumulating 10+ abuse reports.`);
        } else {
          setReports(updatedReports);
          addLog('Listing Flagged', `Listing '${petName}' reported for: ${reason} by ${normalizedEmail}.`);
        }
        
        resolve(true);
      }, 800);
    });
  };

  // Admin Dashboard Operations
  const deleteListingReport = (reportId) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
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
        deleteListingReport,
        addLog,
        setReports,
        setInboxMessages
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
