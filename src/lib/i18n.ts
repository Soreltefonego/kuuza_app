import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  fr: {
    translation: {
      // Navigation
      dashboard: "Tableau de bord",
      activity: "Activité",
      cards: "Cartes",
      settings: "Paramètres",
      logout: "Déconnexion",

      // Dashboard
      welcome: "Bienvenue",
      accountBalance: "Solde du compte",
      availableBalance: "Solde disponible",
      send: "Envoyer",
      receive: "Recevoir",
      recharge: "Recharger",

      // Transactions
      transactionHistory: "Historique des transactions",
      allTransactions: "Toutes",
      credit: "Crédit",
      debit: "Débit",
      pending: "En attente",
      completed: "Complété",
      failed: "Échoué",
      wireTransferReceived: "Virement reçu",
      wireTransferSent: "Virement émis",
      downloadReceipt: "Télécharger le reçu",
      downloadWireOrder: "Télécharger l'ordre de virement",

      // Forms
      amount: "Montant",
      description: "Description",
      senderName: "Nom de l'expéditeur",
      recipientName: "Nom du bénéficiaire",
      accountNumber: "Numéro de compte",
      bankName: "Nom de la banque",
      swiftCode: "Code SWIFT",
      iban: "IBAN",

      // Actions
      confirm: "Confirmer",
      cancel: "Annuler",
      submit: "Soumettre",
      save: "Enregistrer",
      edit: "Modifier",
      delete: "Supprimer",
      download: "Télécharger",
      upload: "Téléverser",

      // Messages
      transactionSuccess: "Transaction réussie",
      transactionPending: "Transaction en cours de traitement",
      transactionFailed: "Échec de la transaction",
      documentRequired: "Document requis pour finaliser le virement",
      uploadDocument: "Veuillez téléverser le document justificatif",

      // Settings
      personalInfo: "Informations personnelles",
      security: "Sécurité",
      notifications: "Notifications",
      language: "Langue",
      changeLanguage: "Changer la langue",
      french: "Français",
      english: "English",

      // Dates
      today: "Aujourd'hui",
      yesterday: "Hier",
      thisWeek: "Cette semaine",
      thisMonth: "Ce mois",

      // Currency
      currency: "Devise",
      usd: "Dollar US",
      eur: "Euro",
      xaf: "Franc CFA",
    },

    // Chat
    chat: {
      title: "Support Client",
      status: "En ligne",
      welcome: "Bonjour! Comment puis-je vous aider?",
      placeholder: "Tapez votre message...",
      errorLoading: "Erreur lors du chargement",
      errorSending: "Erreur lors de l'envoi",
    }
  },
  en: {
    translation: {
      // Navigation
      dashboard: "Dashboard",
      activity: "Activity",
      cards: "Cards",
      settings: "Settings",
      logout: "Logout",

      // Dashboard
      welcome: "Welcome",
      accountBalance: "Account Balance",
      availableBalance: "Available Balance",
      send: "Send",
      receive: "Receive",
      recharge: "Recharge",

      // Transactions
      transactionHistory: "Transaction History",
      allTransactions: "All",
      credit: "Credit",
      debit: "Debit",
      pending: "Pending",
      completed: "Completed",
      failed: "Failed",
      wireTransferReceived: "Wire Transfer Received",
      wireTransferSent: "Wire Transfer Sent",
      downloadReceipt: "Download Receipt",
      downloadWireOrder: "Download Wire Order",

      // Forms
      amount: "Amount",
      description: "Description",
      senderName: "Sender Name",
      recipientName: "Recipient Name",
      accountNumber: "Account Number",
      bankName: "Bank Name",
      swiftCode: "SWIFT Code",
      iban: "IBAN",

      // Actions
      confirm: "Confirm",
      cancel: "Cancel",
      submit: "Submit",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      download: "Download",
      upload: "Upload",

      // Messages
      transactionSuccess: "Transaction successful",
      transactionPending: "Transaction being processed",
      transactionFailed: "Transaction failed",
      documentRequired: "Document required to complete transfer",
      uploadDocument: "Please upload supporting document",

      // Settings
      personalInfo: "Personal Information",
      security: "Security",
      notifications: "Notifications",
      language: "Language",
      changeLanguage: "Change Language",
      french: "Français",
      english: "English",

      // Dates
      today: "Today",
      yesterday: "Yesterday",
      thisWeek: "This week",
      thisMonth: "This month",

      // Currency
      currency: "Currency",
      usd: "US Dollar",
      eur: "Euro",
      xaf: "CFA Franc",

      // Chat
      chat: {
        title: "Customer Support",
        status: "Online",
        welcome: "Hello! How can I help you?",
        placeholder: "Type your message...",
        errorLoading: "Error loading chat",
        errorSending: "Error sending message",
      }
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie']
    }
  })

export default i18n