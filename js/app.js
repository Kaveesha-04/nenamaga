        // --- MODULAR IMPORTS ---
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
        import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js';
        import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
        import { getFirestore, collection, addDoc, updateDoc, doc, onSnapshot, deleteDoc, increment, getDoc, setDoc, query, where } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
        import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';


        // --- Configuration ---
        const GRADES = ["Grade 10", "Grade 11 (O/L)", "Grade 12", "Grade 13 (A/L)"];
        const MEDIUMS = ["Sinhala", "English", "Tamil"];
        const TYPES = ["Short Note", "Past Paper", "Marking Scheme", "Model Paper", "Video Lesson"];
        const SUBJECTS = ["Combined Maths", "Biology", "Physics", "Chemistry", "Mathematics (O/L)", "Science (O/L)", "History", "Sinhala", "English", "Tamil Language", "ICT", "Accounting", "Business Studies", "Econ", "Arts", "Geography", "Logic"];

        // Security: HTML escape helper to prevent XSS
        function escapeHTML(str) {
            if (str === null || str === undefined) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        // Security: Validate URLs to prevent javascript: injection
        function sanitizeURL(url) {
            if (!url) return '#';
            const trimmed = String(url).trim();
            if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
            return '#';
        }

        // --- Translations ---
        const TRANSLATIONS = {
            en: {
                appTitle: "NenaMaga - Education Portal",
                appName: "NenaMaga", appTagline: "Education Portal", heroTitle: "Quality Education,\nVerified for Accuracy.", heroSubtitle: "The premier platform in Sri Lanka, actively monitored and managed to ensure 100% accuracy and high-quality educational resources.", browse: "Library", saved: "My Library", contribute: "Contribute", request: "Requests", admin: "Moderator", searchPlaceholder: "Search resources...", filterTitle: "Smart Filters", allGrades: "All Grades", allSubjects: "All Subjects", allMediums: "All Mediums", noResults: "No materials found", clearFilters: "Clear Filters", beFirst: "Be the first to share knowledge!", addMaterial: "Add Material", submitTitle: "Share Knowledge", submitSubtitle: "Upload a link or a file. Our management team will verify it.", requestTitle: "Need Help?", requestSubtitle: "Request a specific past paper or note from the community.", formGrade: "Grade", formSubject: "Subject", formMedium: "Medium", formType: "Type", formTitle: "Title", formLink: "Resource Link (Drive/YouTube)", formFile: "Upload File (PDF/Image)", formDesc: "Description", formAuthor: "Your Name", submitBtn: "Submit for Verification", requestBtn: "Post Request", submitting: "Processing...", accessBtn: "Access", watchBtn: "Watch Lesson", approve: "Verify & Approve", reject: "Reject", delete: "Delete", report: "Report", pending: "Pending Verification", thankYou: "Received!", successMsg: "Your content is queued for verification.", waitMsg: "Our management team will review it shortly.", adminLogin: "Moderator Access", enterPin: "Enter Moderator PIN", dashboard: "Admin Dashboard", pendingCount: "items pending.", copyLink: "Copied!", reported: "Reported", adminPanel: "Admin", verifiedBadge: "Verified", "newBadge": "New", requestTabTitle: "Community Requests", fulfillBtn: "Fulfill", reqSuccess: "Request posted!", noSaved: "No saved items yet.", saveHint: "Tap the heart icon to save items.", footerAbout: "About Us", footerContact: "Contact", footerPrivacy: "Privacy Policy", installApp: "Install App", shareWhatsapp: "Share", autoHidden: "Under Review", invalidUrl: "Invalid URL", loginTitle: "Admin Access", unlock: "Unlock", reqSuccessMsg: "Request posted!", sortBy: "Sort By", sortNewest: "Newest", sortOldest: "Oldest", sortName: "Name (A-Z)", uploadProgress: "Uploading... ", adminEmail: "Admin Email", adminPassword: "Password", confirmDelete: "Are you sure you want to permanently delete this resource"
            },
            si: {
                appTitle: "නැණමග - අධ්‍යාපන ද්වාරය",
                appName: "නැණමග", appTagline: "අධ්‍යාපන ද්වාරය", heroTitle: "ගුණාත්මක අධ්‍යාපනය, \nවිශේෂඥයින් විසින් සත්‍යාපිතයි.", heroSubtitle: "ශ්‍රී ලංකාවේ විශ්වවිද්‍යාල සිසුන් විසින් සක්‍රීයව අධීක්ෂණය කරනු ලබන එකම අධ්‍යාපනික වේදිකාව.", browse: "පුස්තකාලය", saved: "මගේ එකතුව", contribute: "දායක වන්න", request: "ඉල්ලීම්", admin: "පරිපාලක", searchPlaceholder: "සොයන්න...", filterTitle: "පෙරහන්", allGrades: "සියලුම ශ්‍රේණි", allSubjects: "සියලුම විෂයයන්", allMediums: "සියලුම මාධ්‍යයන්", noResults: "දත්ත හමු නොවීය", clearFilters: "පෙරහන් ඉවත් කරන්න", beFirst: "පළමුවැන්නා වී දැනුම බෙදාගන්න!", addMaterial: "ද්‍රව්‍ය එක් කරන්න", submitTitle: "දැනුම බෙදාගන්න", submitSubtitle: "සබැඳියක් හෝ ගොනුවක් Upload කරන්න. විශ්වවිද්‍යාල කණ්ඩායම පරීක්ෂා කරනු ඇත.", requestTitle: "අවශ්‍ය දේ නැද්ද?", requestSubtitle: "ඔබට අවශ්‍ය දේ ඉල්ලා සිටින්න.", formGrade: "ශ්‍රේණිය", formSubject: "විෂය", formMedium: "මාධ්‍යය", formType: "වර්ගය", formTitle: "මාතෘකාව", formLink: "සම්පත් සබැඳිය", formFile: "ගොනුවක් Upload කරන්න (PDF/Image)", formDesc: "විස්තරය", formAuthor: "ඔබේ නම", submitBtn: "යොමු කරන්න", requestBtn: "ඉල්ලීම පලකරන්න", submitting: "යොමු කරමින්...", accessBtn: "පිවිසෙන්න", watchBtn: "නරඹන්න", approve: "අනුමත කරන්න", reject: "ප්‍රතික්ෂේප කරන්න", delete: "මකන්න", report: "වාර්තා කරන්න", pending: "පරීක්ෂා වෙමින්", thankYou: "ස්තුතියි!", successMsg: "සාර්ථකයි.", waitMsg: "අනුමැතියෙන් පසු මෙය දිස්වනු ඇත.", adminLogin: "පරිපාලක පිවිසුම", enterPin: "මුරපදය ඇතුලත් කරන්න", dashboard: "පරිපාලක පුවරුව", pendingCount: "අනුමත කිරීමට ඇත.", copyLink: "පිටපත් විය!", reported: "වාර්තා කර ඇත", adminPanel: "පරිපාලක", verifiedBadge: "තහවුරු කර ඇත", newBadge: "නව", requestTabTitle: "ප්‍රජා ඉල්ලීම්", fulfillBtn: "ඉල්ලීම ඉටු කරන්න", reqSuccess: "ඉල්ලීම සාර්ථකයි!", noSaved: "සුරැකූ දත්ත නැත.", saveHint: "හෘදය ලකුණ ඔබන්න.", footerAbout: "අප ගැන", footerContact: "සම්බන්ධ වන්න", footerPrivacy: "රහස්‍යතා", installApp: "App එක", shareWhatsapp: "බෙදාගන්න", autoHidden: "ඉවත් කර ඇත.", invalidUrl: "වැරදි සබැඳියක්", loginTitle: "පරිපාලක", unlock: "ඇතුල් වන්න", reqSuccessMsg: "සාර්ථකයි!", sortBy: "වර්ග කරන්න", sortNewest: "අලුත්ම", sortOldest: "පැරණිම", sortName: "නම (A-Z)", uploadProgress: "උඩුගත කරමින්... ", adminEmail: "පරිපාලක ඊමේල්", adminPassword: "මුරපදය", confirmDelete: "මෙම දත්තය ස්ථිරවම මැකීමට අවශ්‍යද"
            },
            ta: {
                appTitle: "நெனமக - கல்வி போர்டல்",
                appName: "நெனமக", appTagline: "கல்வி போர்டல்", heroTitle: "உயர் தரக் கல்வி, \nநிபுணர்களால் உறுதிப்படுத்தப்பட்டது.", heroSubtitle: "இலங்கை பல்கலைக்கழக மாணவர்களால் கண்காணிக்கப்படும் ஒரே தளம்.", browse: "நூலகம்", saved: "சேகரிப்பு", contribute: "பங்களிப்பு", request: "கோரிக்கைகள்", admin: "நிர்வாகி", searchPlaceholder: "தேடுங்கள்...", filterTitle: "வடிகட்டி", allGrades: "அனைத்து வகுப்புகள்", allSubjects: "அனைத்து பாடங்கள்", allMediums: "அனைத்து மொழிகள்", noResults: "முடிவுகள் இல்லை", clearFilters: "அழிக்கவும்", beFirst: "அறிவைப் பகிருங்கள்!", addMaterial: "சேர்க்கவும்", submitTitle: "அறிவைப் பகிருங்கள்", submitSubtitle: "இணைப்பு அல்லது கோப்பை சேர்க்கவும். பல்கலைக்கழகக் குழு சரிபார்க்கும்.", requestTitle: "கிடைக்கவில்லையா?", requestSubtitle: "தேவையானதைக் கோருங்கள்.", formGrade: "தரம்", formSubject: "பாடம்", formMedium: "மொழி", formType: "வகை", formTitle: "தலைப்பு", formLink: "வள இணைப்பு", formFile: "கோப்பை பதிவேற்றவும் (PDF/Image)", formDesc: "விளக்கம்", formAuthor: "பெயர்", submitBtn: "அனுப்பவும்", requestBtn: "கோரிக்கையை இடுங்கள்", submitting: "செயலாக்கப்படுகிறது...", accessBtn: "பார்க்க", watchBtn: "பார்க்க", approve: "ஏற்கவும்", reject: "நிராகரிக்கவும்", delete: "நீக்கு", report: "புகாரளி", pending: "சரிபார்ப்பில்", thankYou: "நன்றி!", successMsg: "வெற்றி.", waitMsg: "சரிபார்ப்புக்குப் பிறகு தோன்றும்.", adminLogin: "நிர்வாகி", enterPin: "கடவுச்சொல்", dashboard: "நிர்வாகப் பலகம்", pendingCount: "காத்திருக்கிறது.", copyLink: "நகலெடுக்கப்பட்டது!", reported: "புகாரளிக்கப்பட்டது", adminPanel: "நிர்வாகி", verifiedBadge: "சரிபார்க்கப்பட்டது", newBadge: "புதியது", requestTabTitle: "சமூகக் கோரிக்கைகள்", fulfillBtn: "நிறைவேற்றுங்கள்", reqSuccess: "வெற்றி!", noSaved: "இல்லை.", saveHint: "சேமிக்க கிளிக் செய்யவும்.", footerAbout: "எங்களைப் பற்றி", footerContact: "தொடர்பு", footerPrivacy: "தனியுரிமை", installApp: "செயலியை நிறுவவும்", shareWhatsapp: "பகிரவும்", autoHidden: "மறைக்கப்பட்டுள்ளது.", invalidUrl: "சரியான URL தேவை", loginTitle: "நிர்வாகி", unlock: "திறக்க", reqSuccessMsg: "வெற்றி!", sortBy: "வரிசைப்படுத்து", sortNewest: "புதியது", sortOldest: "பழையது", sortName: "பெயர் (A-Z)", uploadProgress: "பதிவேற்றப்படுகிறது... ", adminEmail: "நிர்வாகி மின்னஞ்சல்", adminPassword: "கடவுச்சொல்", confirmDelete: "இதை நிரந்தரமாக நீக்க விரும்புகிறீர்களா"
            }
        };

        // --- NEW: Translation Objects for Modals ---
        const MODAL_CONTENT = {
            en: {
                about: `
                    <p class="mb-4">NenaMaga is Sri Lanka's premium educational resource portal, dedicated to providing high-quality, verified materials (past papers, notes, video lessons) for G.C.E. O/L and A/L students.</p>
                    <p class="mb-4 font-semibold text-brand-600 dark:text-brand-400">Our promise:</p>
                    <ul class="list-disc list-inside text-left space-y-2 pl-4 text-sm">
                        <li>All content is carefully verified for accuracy by our management team before being published.</li>
                        <li>The platform is completely free to use.</li>
                        <li>We rely on community contributions and careful moderation.</li>
                    </ul>
                    <p class="mt-6 text-xs text-slate-400">Developed in 2025 as a collaborative open-source project.</p>
                `,
                contact: `
                    <p class="mb-4">If you have questions, feedback, or need support regarding a submission or content verification, please reach out.</p>
                    <div class="text-left space-y-4 font-medium bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p class="flex items-center break-all"><i data-lucide="at-sign" class="h-5 w-5 text-brand-500 mr-3 shrink-0"></i> <span>sup.nenamaga@gmail.com</span></p>
                        <p class="flex items-center"><i data-lucide="message-circle" class="h-5 w-5 text-brand-500 mr-3 shrink-0"></i> <span>WhatsApp: +94 75 8574437</span></p>
                    </div>
                    <p class="text-xs text-slate-400 pt-4 text-center">Note: We are staffed by volunteers, please be patient.</p>
                `,
                privacy: `
                    <p class="mb-4 text-sm md:text-base">This application respects your privacy. We only collect the minimum amount of data necessary to provide and improve the service.</p>
                    <div class="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mb-4">
                        <p class="mb-2 font-bold text-brand-600 dark:text-brand-400 text-sm uppercase tracking-wide">Key Points:</p>
                        <ul class="list-disc list-inside text-left space-y-2 pl-2 text-sm md:text-sm">
                            <li><strong class="text-slate-700 dark:text-slate-200">Authentication:</strong> We use anonymous tokens for security.</li>
                            <li><strong class="text-slate-700 dark:text-slate-200">Storage:</strong> Your uploads & requests are stored securely in Google Firebase.</li>
                            <li><strong class="text-slate-700 dark:text-slate-200">No Tracking:</strong> We do not track your location or sell personal data.</li>
                            <li><strong class="text-slate-700 dark:text-slate-200">Moderation:</strong> Uploads are reviewed publicly.</li>
                        </ul>
                    </div>
                    <p class="mt-4 text-xs text-slate-400 text-center">By using NenaMaga, you agree to these terms.</p>
                `,
                buttonUnderstood: "Understood"
            },
            si: {
                about: `
                    <p class="mb-4">නැණමග යනු ශ්‍රී ලංකාවේ ප්‍රමුඛතම අධ්‍යාපනික සම්පත් ද්වාරයයි. අ.පො.ස. සා/පෙළ සහ උ/පෙළ සිසුන් සඳහා උසස් තත්ත්වයේ, සත්‍යාපිත ද්‍රව්‍ය (පසුගිය ප්‍රශ්න පත්‍ර, සටහන්, වීඩියෝ පාඩම්) සැපයීමට අපි කැපවී සිටිමු.</p>
                    <p class="mb-4 font-semibold text-brand-600 dark:text-brand-400">අපගේ පොරොන්දුව:</p>
                    <ul class="list-disc list-inside text-left space-y-2 pl-4 text-sm">
                        <li>සියලුම අන්තර්ගතයන් විශ්වවිද්‍යාල සිසුන් විසින් පරීක්ෂා කර තහවුරු කරනු ලැබේ.</li>
                        <li>මෙම වේදිකාව භාවිතා කිරීම සම්පූර්ණයෙන්ම නොමිලේ.</li>
                        <li>අපි ප්‍රජා දායකත්වය සහ සුපරීක්ෂාකාරී අධීක්ෂණය මත රඳා පවතිමු.</li>
                    </ul>
                    <p class="mt-6 text-xs text-slate-400">2025 දී විවෘත මෘදුකාංග ව්‍යාපෘතියක් ලෙස සංවර්ධනය කරන ලදී.</p>
                `,
                contact: `
                    <p class="mb-4">ඔබට ප්‍රශ්න, යෝජනා තිබේ නම් හෝ අන්තර්ගත සත්‍යාපනය සම්බන්ධයෙන් සහාය අවශ්‍ය නම්, කරුණාකර අප හා සම්බන්ධ වන්න.</p>
                    <div class="text-left space-y-4 font-medium bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p class="flex items-center break-all"><i data-lucide="at-sign" class="h-5 w-5 text-brand-500 mr-3 shrink-0"></i> <span>sup.nenamaga@gmail.com</span></p>
                        <p class="flex items-center"><i data-lucide="message-circle" class="h-5 w-5 text-brand-500 mr-3 shrink-0"></i> <span>WhatsApp: +94 75 8574437</span></p>
                    </div>
                    <p class="text-xs text-slate-400 pt-4 text-center">සටහන: අපි ස්වේච්ඡා සේවකයන් බැවින් ප්‍රතිචාර දැක්වීමට සුළු කාලයක් ගත විය හැක.</p>
                `,
                privacy: `
                    <p class="mb-4 text-sm md:text-base">මෙම යෙදුම ඔබගේ පෞද්ගලිකත්වයට ගරු කරයි. සේවාව සැපයීමට සහ වැඩිදියුණු කිරීමට අවශ්‍ය අවම දත්ත පමණක් අපි රැස් කරමු.</p>
                    <div class="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mb-4">
                        <p class="mb-2 font-bold text-brand-600 dark:text-brand-400 text-sm uppercase tracking-wide">ප්‍රධාන කරුණු:</p>
                        <ul class="list-disc list-inside text-left space-y-2 pl-2 text-sm md:text-sm">
                            <li><strong class="text-slate-700 dark:text-slate-200">සත්‍යාපනය:</strong> අපි ආරක්ෂාව සඳහා නිර්නාමික ටෝකන භාවිතා කරමු.</li>
                            <li><strong class="text-slate-700 dark:text-slate-200">ගබඩා කිරීම:</strong> ඔබේ දත්ත Google Firebase හි ආරක්ෂිතව ගබඩා කර ඇත.</li>
                            <li><strong class="text-slate-700 dark:text-slate-200">ලුහුබැඳීම් නැත:</strong> අපි ඔබේ ස්ථානය නිරීක්ෂණය නොකරන අතර පුද්ගලික දත්ත විකුණන්නේ නැත.</li>
                        </ul>
                    </div>
                    <p class="mt-4 text-xs text-slate-400 text-center">නැණමග භාවිතා කිරීමෙන් ඔබ මෙම කොන්දේසි වලට එකඟ වේ.</p>
                `,
                buttonUnderstood: "තේරුම් ගත්තා"
            },
            ta: {
                about: `
                    <p class="mb-4">நெனமக இலங்கையின் பிரீமியம் கல்வி வள போர்டல் ஆகும். க.பொ.த சா/த மற்றும் உ/த மாணவர்களுக்கு உயர் தரமான, சரிபார்க்கப்பட்ட வளங்களை (கடந்த கால வினாத்தாள்கள், குறிப்புகள், வீடியோ பாடங்கள்) வழங்க நாங்கள் அர்ப்பணித்துள்ளோம்.</p>
                    <p class="mb-4 font-semibold text-brand-600 dark:text-brand-400">எங்கள் உறுதிமொழி:</p>
                    <ul class="list-disc list-inside text-left space-y-2 pl-4 text-sm">
                        <li>அனைத்து உள்ளடக்கங்களும் பல்கலைக்கழக மாணவர்களால் சரிபார்க்கப்படுகின்றன.</li>
                        <li>இந்த தளம் பயன்படுத்த முற்றிலும் இலவசம்.</li>
                        <li>நாங்கள் சமூக பங்களிப்புகள் மற்றும் கவனமான கண்காணிப்பை நம்பியுள்ளோம்.</li>
                    </ul>
                    <p class="mt-6 text-xs text-slate-400">2025 இல் திறந்த மூல திட்டமாக உருவாக்கப்பட்டது.</p>
                `,
                contact: `
                    <p class="mb-4">உங்களுக்கு கேள்விகள், கருத்துகள் இருந்தால் அல்லது உள்ளடக்க சரிபார்ப்பு குறித்து உதவி தேவைப்பட்டால், எங்களை தொடர்பு கொள்ளவும்.</p>
                    <div class="text-left space-y-4 font-medium bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p class="flex items-center break-all"><i data-lucide="at-sign" class="h-5 w-5 text-brand-500 mr-3 shrink-0"></i> <span>sup.nenamaga@gmail.com</span></p>
                        <p class="flex items-center"><i data-lucide="message-circle" class="h-5 w-5 text-brand-500 mr-3 shrink-0"></i> <span>WhatsApp: +94 75 8574437</span></p>
                    </div>
                    <p class="text-xs text-slate-400 pt-4 text-center">குறிப்பு: நாங்கள் தன்னார்வலர்கள், எனவே தயவுசெய்து பொறுமையாக இருக்கவும்.</p>
                `,
                privacy: `
                    <p class="mb-4 text-sm md:text-base">இந்த பயன்பாடு உங்கள் தனியுரிமையை மதிக்கிறது. சேவையை வழங்கவும் மேம்படுத்தவும் தேவையான குறைந்தபட்ச தரவை மட்டுமே நாங்கள் சேகரிக்கிறோம்.</p>
                    <div class="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mb-4">
                        <p class="mb-2 font-bold text-brand-600 dark:text-brand-400 text-sm uppercase tracking-wide">முக்கிய குறிப்புகள்:</p>
                        <ul class="list-disc list-inside text-left space-y-2 pl-2 text-sm md:text-sm">
                            <li><strong class="text-slate-700 dark:text-slate-200">பாதுகாப்பு:</strong> பாதுகாப்பிற்காக நாங்கள் அநாமதேய டோக்கன்களைப் பயன்படுத்துகிறோம்.</li>
                            <li><strong class="text-slate-700 dark:text-slate-200">சேமிப்பு:</strong> உங்கள் தரவு Google Firebase இல் பாதுகாப்பாக சேமிக்கப்படுகிறது.</li>
                            <li><strong class="text-slate-700 dark:text-slate-200">கண்காணிப்பு இல்லை:</strong> நாங்கள் உங்கள் இருப்பிடத்தைக் கண்காணிக்கவோ தனிப்பட்ட தரவை விற்கவோ மாட்டோம்.</li>
                        </ul>
                    </div>
                    <p class="mt-4 text-xs text-slate-400 text-center">நெனமகவைப் பயன்படுத்துவதன் மூலம், இந்த விதிமுறைகளை ஏற்கிறீர்கள்.</p>
                `,
                buttonUnderstood: "புரிந்து கொண்டேன்"
            }
        };

        window.app = {
            user: null,
            page: 'home',
            lang: 'en',
            isAdmin: false,
            darkMode: false,
            resources: [],
            requests: [],
            search: '',
            isLoading: true,
            debounceTimer: null,
            filters: { grade: 'All', subject: 'All', medium: 'All' },
            sortBy: 'newest',
            savedIds: JSON.parse(localStorage.getItem('nenaMagaSaved') || '[]'),
            adminClickCount: 0,
            db: null,
            storage: null, 
            formSuccess: false, 
            appId: typeof __app_id !== 'undefined' ? __app_id : 'default-app-id',
            adminPin: null, 
            currentStep1Data: {},
            currentManualLink: '',
            
            // State for file upload
            uploadedFileUrl: '',
            fileUploadProgress: 0,
            isUploading: false,

            // State for fulfilling a request
            fulfillmentData: null, 
            submissionStep: 1, 

            // FIX: Helper function to check for DB connection status
            checkDbReady: function() {
                if (!this.db) {
                    this.showToast("Database is not connected. Check console for configuration errors.", "error");
                    return false;
                }
                return true;
            },

            // FIX: Helper function to delete a file using its full download URL (Modular approach)
            deleteStorageFileByDownloadURL: async function(downloadUrl) {
                if (!this.storage || !downloadUrl || !downloadUrl.includes('firebasestorage.googleapis.com')) {
                    console.warn("Not a Firebase Storage URL or storage not initialized. Skipping file deletion.");
                    return;
                }
                
                try {
                    const url = new URL(downloadUrl);
                    // Path is located after /o/ and before the first query parameter (?)
                    const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
                    const fileRef = storageRef(this.storage, path);
                    await deleteObject(fileRef);
                    console.log("Storage file deleted successfully.");
                } catch (error) {
                    console.error("Failed to delete Storage file:", error);
                }
            },


            // --- CORE INITIALIZATION ---

            init: async function() {
                this.checkHash();
                // Dynamic copyright year
                const yearEl = document.getElementById('copyright-year');
                if (yearEl) yearEl.textContent = new Date().getFullYear();
                
                // Add window scroll listener for the scroll-to-top button
                window.addEventListener('scroll', () => {
                    const btn = document.getElementById('scroll-top-btn');
                    if (window.scrollY > 300) {
                        btn.classList.remove('translate-y-20', 'opacity-0');
                    } else {
                        btn.classList.add('translate-y-20', 'opacity-0');
                    }
                });

                // FIX: Use explicit window.app prefix for delegation to ensure methods are found
                document.addEventListener('click', (e) => {
                    const target = e.target.closest('[data-nav-page]');
                    if (target) {
                        e.preventDefault();
                        window.app.setPage(target.getAttribute('data-nav-page'));
                        // Close mobile menu if open
                        const menu = document.getElementById('mobile-menu');
                        if (!menu.classList.contains('hidden')) {
                            window.app.toggleMobileMenu();
                        }
                        return; // Prevent further action processing
                    }
                    
                    const actionTarget = e.target.closest('[data-nav-action]');
                    if (actionTarget) {
                        e.preventDefault();
                        const action = actionTarget.getAttribute('data-nav-action');
                        if (action === 'secret-admin-click') {
                            window.app.handleSecretAdminClick();
                        }
                    }
                });
                
                // Continue Firebase/Data initialization
                window.addEventListener('hashchange', () => this.checkHash());
                window.addEventListener('online', () => window.app.showToast("You are back online!", "success"));
                window.addEventListener('offline', () => window.app.showToast("You are offline.", "error"));

                let config;
                try {
                    // @ts-ignore
                    // If you are NOT using a deployment pipeline, replace this line:
                    // if (typeof __firebase_config !== 'undefined') config = JSON.parse(__firebase_config);
                    // With your copied config object:
                    config = {
                        apiKey: "AIzaSyAIBfoJwzIkoYZYNPJAKDyvEpsiEv4-MYs",
                        authDomain: "nenamaga-edu.firebaseapp.com",
                        projectId: "nenamaga-edu",
                        storageBucket: "nenamaga-edu.firebasestorage.app",
                        messagingSenderId: "254639684138",
                        appId: "1:254639684138:web:de413c38c54f277649e153",
                        measurementId: "G-CB9YVW5NNX"
                    };

                } catch (e) { console.log("Env config missing"); }


                if (!config) {
                    console.error("Firebase config not found. App functionality will be limited.");
                    this.render();
                    return; 
                }

                try {
                    const firebaseApp = initializeApp(config);
                    const analytics = getAnalytics(firebaseApp);
                    const auth = getAuth(firebaseApp);
                    this.auth = auth;
                    this.db = getFirestore(firebaseApp);
                    this.storage = getStorage(firebaseApp); 

                    // Set up Authentication
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        await signInWithCustomToken(auth, __initial_auth_token);
                    } else {
                        try {
                            await signInAnonymously(auth);
                        } catch (err) { console.warn("Auth warning:", err); }
                    }

                    // CRITICAL: Auth State Change listener ensures we wait for the user object
                    onAuthStateChanged(auth, async (u) => {
                        this.user = u;
                        this.isAdmin = !!(u && u.email); // If email exists, they logged in as Admin
                        this.setupListeners();
                        if (this.isAdmin && this.page !== 'admin') {
                            this.setPage('admin');
                        }
                    });

                    if (localStorage.getItem('nenaMagaTheme') === 'dark' || (!localStorage.getItem('nenaMagaTheme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                        this.toggleDarkMode(true);
                    }
                } catch (e) {
                    console.error("Init Error", e);
                    window.app.showToast("Connection Issue. Check Console for Config Errors.", "error"); 
                    // Set to null to indicate failure
                    this.db = null;
                    this.storage = null;
                }
                
                this.render();
            },
            
            // --- UI/STATE HELPERS ---

            checkHash: function() {
                const hash = window.location.hash.slice(1);
                if (['home', 'saved', 'request', 'contribute', 'admin'].includes(hash)) {
                    this.page = hash;
                    this.formSuccess = false; 
                    if (hash === 'contribute') {
                        // If navigating to contribute directly, reset step unless fulfilling
                        if (!this.fulfillmentData) {
                            this.submissionStep = 1;
                            this.uploadedFileUrl = '';
                            this.isUploading = false;
                            this.fileUploadProgress = 0;
                        }
                    } else {
                        this.fulfillmentData = null; // Clear fulfillment if navigating away
                    }
                } else {
                    this.page = 'home';
                    this.fulfillmentData = null;
                }
                this.render();
                this.updateNavState();
            },

            setPage: function(page) {
                window.location.hash = page;
                window.scrollTo({ top: 0, behavior: 'smooth' });
                this.page = page;
            },

            updateNavState: function() {
                // Update navigation button styles
                document.querySelectorAll('.nav-btn').forEach(btn => {
                    // Use data-nav-page attribute for comparison
                    const page = btn.getAttribute('data-nav-page');
                    const isActive = page === this.page;

                    if(isActive) {
                        btn.className = 'nav-btn flex items-center px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-md ring-1 ring-slate-900/5';
                    } else {
                        btn.className = 'nav-btn flex items-center px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200';
                    }
                });
            },

            t: function(key) { return TRANSLATIONS[this.lang][key] || key; },

            toggleLang: function() {
                this.lang = this.lang === 'en' ? 'si' : this.lang === 'si' ? 'ta' : 'en';
                document.getElementById('current-lang').textContent = this.lang.toUpperCase();
                this.render(); // Force re-render to update all translated elements
            },

            toggleDarkMode: function(forceDark = null) {
                const isDark = forceDark !== null ? forceDark : !this.darkMode;
                this.darkMode = isDark;
                const html = document.documentElement;
                const icon = document.getElementById('theme-icon');
                
                if (isDark) {
                    html.classList.add('dark');
                    icon.setAttribute('data-lucide', 'sun');
                    localStorage.setItem('nenaMagaTheme', 'dark');
                } else {
                    html.classList.remove('dark');
                    icon.setAttribute('data-lucide', 'moon');
                    localStorage.setItem('nenaMagaTheme', 'light');
                }
                lucide.createIcons();
            },

            toggleMobileMenu: function() {
                const menu = document.getElementById('mobile-menu');
                const isOpen = !menu.classList.contains('hidden');
                menu.classList.toggle('hidden');
                const icon = document.getElementById('menu-icon');
                icon.setAttribute('data-lucide', isOpen ? 'menu' : 'x');
                lucide.createIcons();
            },
            
            showToast: function(message, type = 'info') {
                const container = document.getElementById('toast-container');
                const toast = document.createElement('div');
                let iconHtml = '';
                let bgColor = 'bg-slate-800';
                let iconColor = 'text-white';

                if (type === 'success') {
                    iconHtml = '<i data-lucide="check-circle" class="h-5 w-5"></i>';
                    bgColor = 'bg-emerald-600';
                } else if (type === 'error') {
                    iconHtml = '<i data-lucide="x-circle" class="h-5 w-5"></i>';
                    bgColor = 'bg-red-600';
                } else if (type === 'info') {
                    iconHtml = '<i data-lucide="info" class="h-5 w-5"></i>';
                    bgColor = 'bg-brand-600';
                } else if (type === 'warning') {
                     iconHtml = '<i data-lucide="alert-triangle" class="h-5 w-5"></i>';
                    bgColor = 'bg-orange-600';
                }
                
                toast.className = `p-4 flex items-center gap-3 rounded-xl shadow-2xl text-white font-medium text-sm ${bgColor} transform translate-x-full transition-all duration-300`;
                toast.style.pointerEvents = 'auto'; 
                toast.innerHTML = `${iconHtml}<span>${message}</span>`;
                
                container.appendChild(toast);
                lucide.createIcons();

                // Animate in
                setTimeout(() => {
                    toast.classList.remove('translate-x-full');
                }, 10);

                // Animate out and remove
                setTimeout(() => {
                    toast.classList.add('opacity-0');
                    setTimeout(() => {
                        toast.remove();
                    }, 500);
                }, 4000);
            },
            
            showInfo: function(type) {
                // Renders the internal contact/about modal
                window.app.showAppInfoModal(type);
            },


            // --- DATA / ADMIN FUNCTIONS ---
            
            setupListeners: function() {
                if (!this.checkDbReady()) return;
                const safeAppId = this.appId;

                onSnapshot(collection(this.db, 'artifacts', safeAppId, 'public', 'data', 'resources'), (snap) => {
                    this.resources = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    this.isLoading = false;
                    const loader = document.getElementById('global-loader');
                    if (loader) {
                        loader.style.opacity = '0';
                        setTimeout(() => loader.remove(), 500);
                    }
                    if(['home', 'saved', 'admin', 'contribute'].includes(this.page)) this.render();
                });

                onSnapshot(collection(this.db, 'artifacts', safeAppId, 'public', 'data', 'requests'), (snap) => {
                    this.requests = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    if(this.page === 'request' || this.page === 'admin') this.render();
                });
            },

            deleteRequest: async function(id) {
                if (!this.checkDbReady()) return;
                try {
                    const docRef = doc(this.db, 'artifacts', this.appId, 'public', 'data', 'requests', id);
                    await deleteDoc(docRef);
                    window.app.showToast("Related request successfully fulfilled and cleared!", "success");
                } catch (e) {
                    console.error("Error deleting fulfilled request: ", e);
                    window.app.showToast("Warning: Could not clear fulfilled request from list.", "warning"); 
                }
            },
            
            // --- ADMIN MODAL FUNCTIONS (Grouped for reliability) ---
            
            showAdminLoginModal: function() {
                const t = this.t.bind(this);
                const modal = document.getElementById('modal-container');
                modal.innerHTML = `
                    <div class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-fade-in">
                        <div class="bg-white dark:bg-slate-800 p-10 rounded-[2rem] shadow-2xl w-full max-w-sm relative transform transition-all scale-100 border border-white/20">
                            <button onclick="document.getElementById('modal-container').innerHTML=''" class="absolute top-5 right-5 text-slate-400 hover:text-slate-600"><i data-lucide="x"></i></button>
                            <div class="text-center mb-8">
                                <div class="inline-flex p-4 bg-red-100 dark:bg-red-900/40 rounded-full mb-5 text-red-600 shadow-sm ring-1 ring-red-500/10"><i data-lucide="lock" class="h-8 w-8"></i></div>
                                <h3 class="text-2xl font-bold font-display text-slate-900 dark:text-white">${t('loginTitle')}</h3>
                                <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Moderator access only.</p>
                            </div>
                            <form onsubmit="event.preventDefault(); window.app.loginAdmin(document.getElementById('admin-email-input').value, document.getElementById('admin-pin-input').value)">
                                <div class="space-y-4">
                                    <div class="space-y-1.5">
                                        <label class="form-group-label">${t('adminEmail')}</label>
                                        <div class="relative group">
                                            <i data-lucide="mail" class="h-5 w-5 group-focus-within:text-brand-500 transition-colors form-group-icon-wrapper"></i>
                                            <input required id="admin-email-input" type="email" class="form-input-clean" placeholder="admin@nenamaga.com">
                                        </div>
                                    </div>
                                    <div class="space-y-1.5 mt-4">
                                        <label class="form-group-label">${t('adminPassword')}</label>
                                        <div class="relative group">
                                            <i data-lucide="key-round" class="h-5 w-5 group-focus-within:text-brand-500 transition-colors form-group-icon-wrapper"></i>
                                            <input required id="admin-pin-input" type="password" class="form-input-clean" placeholder="****">
                                        </div>
                                    </div>
                                    <button type="submit" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-2xl shadow-xl hover:shadow-2xl shadow-brand-500/20 mt-6">${t('unlock')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;
                lucide.createIcons();
            },

            loginAdmin: async function(email, password) {
                if (!this.checkDbReady()) return;
                try {
                    await signInWithEmailAndPassword(this.auth, email, password);
                    this.isAdmin = true;
                    document.getElementById('modal-container').innerHTML = '';
                    window.app.showToast("Admin access granted.", "success");
                    this.setPage('admin');
                } catch (error) {
                    window.app.showToast("Auth failed: " + error.message, "error");
                    console.error("Admin login error:", error);
                }
            },

            logoutAdmin: async function() {
                try {
                    await signOut(this.auth);
                    this.isAdmin = false;
                    window.app.showToast("Logged out of Admin Panel.", "info");
                    this.setPage('home');
                    // Re-authenticate anonymously to keep app working
                    await signInAnonymously(this.auth);
                } catch (error) {
                    console.error("Logout error:", error);
                }
            },


            
            // --- RESOURCE/REQUEST ACTION HANDLERS ---
            
            handleSecretAdminClick: function() {
                this.adminClickCount++;
                if (this.adminClickCount >= 5 && !this.isAdmin) {
                    this.showAdminLoginModal();
                    this.adminClickCount = 0;
                }
            },

            handleSubjectChange: function(value) {
                const otherInput = document.getElementById('subject-other-input');
                const otherNameInput = document.getElementById('subject-other-name');
                if (otherInput && otherNameInput) {
                    if (value === 'Other') {
                        otherInput.classList.remove('hidden');
                        otherNameInput.required = true;
                    } else {
                        otherInput.classList.add('hidden');
                        otherNameInput.required = false;
                        // Clear value if hidden to prevent false submission
                        otherNameInput.value = '';
                    }
                }
            },

            handleRequestSubjectChange: function(value) {
                const otherInputWrapper = document.getElementById('request-subject-other-input');
                const otherInput = otherInputWrapper ? otherInputWrapper.querySelector('input') : null;
                
                if (otherInputWrapper && otherInput) {
                    if (value === 'Other') {
                        otherInputWrapper.classList.remove('hidden');
                        otherInput.required = true;
                    } else {
                        otherInputWrapper.classList.add('hidden');
                        otherInput.required = false;
                        otherInput.value = '';
                    }
                }
            },
            
            handleFileUpload: function(fileInput) {
                const file = fileInput.files[0];
                const linkInput = document.getElementById('resource-link');
                
                // Reset state for new upload attempt
                this.uploadedFileUrl = '';
                this.isUploading = false;
                this.fileUploadProgress = 0;

                if (file) {
                    linkInput.disabled = true;
                    linkInput.value = ''; // Clear link when file is selected
                    this.checkLink(linkInput); // Update link display state
                } else {
                    // Re-enable link if file selection is cleared
                    linkInput.disabled = false;
                    this.renderContribute(document.getElementById('main-content'));
                    return;
                }

                if (!this.checkDbReady() || !this.storage || !this.user || !this.user.uid) { 
                    window.app.showToast("Database/Authentication required. Please wait for page to fully load.", "error");
                    fileInput.value = '';
                    linkInput.disabled = false;
                    this.renderContribute(document.getElementById('main-content'));
                    return;
                }
                
                if (file.size > 20 * 1024 * 1024) { 
                    window.app.showToast("File is too large (max 20MB).", "error");
                    fileInput.value = '';
                    linkInput.disabled = false;
                    this.renderContribute(document.getElementById('main-content'));
                    return;
                }

                this.isUploading = true;
                this.fileUploadProgress = 0;
                this.renderContribute(document.getElementById('main-content')); 

                const fileExtension = file.name.split('.').pop();
                const safeFileName = `${Date.now()}-${this.user.uid}.${fileExtension}`;
                const fileRef = storageRef(this.storage, `artifacts/${this.appId}/uploads/${safeFileName}`);
                
                const uploadTask = uploadBytesResumable(fileRef, file);

                uploadTask.on('state_changed', 
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        this.fileUploadProgress = Math.round(progress);
                        const progressBar = document.getElementById('upload-progress-bar');
                        if (progressBar) {
                            progressBar.style.width = `${this.fileUploadProgress}%`;
                            const progressTextDisplay = document.getElementById('upload-progress-text');
                            if(progressTextDisplay) progressTextDisplay.innerText = `${this.fileUploadProgress}`;
                        }
                    }, 
                    (error) => {
                        console.error("Upload failed", error);
                        this.isUploading = false;
                        this.fileUploadProgress = 0;
                        this.uploadedFileUrl = '';
                        window.app.showToast("Upload failed! Check Storage Rules.", "error"); 
                        this.renderContribute(document.getElementById('main-content'));
                        linkInput.disabled = false; // Re-enable link
                    }, 
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            this.uploadedFileUrl = downloadURL;
                            this.isUploading = false;
                            this.fileUploadProgress = 100;
                            window.app.showToast("File uploaded!", "success");
                            this.renderContribute(document.getElementById('main-content'));
                        });
                    }
                );
            },
            
            checkLink: function(input) {
                const badge = document.getElementById('video-badge');
                const fileInput = document.getElementById('file-upload');
                const fileDisplay = document.getElementById('file-text-display');

                if (badge) {
                    if (input.value.toLowerCase().includes('youtube.com') || input.value.toLowerCase().includes('youtu.be')) {
                        badge.classList.remove('hidden');
                        badge.classList.add('flex');
                    } else {
                        badge.classList.add('hidden');
                        badge.classList.remove('flex');
                    }
                }
                
                // IMPROVEMENT: Toggle file input state based on link input
                if (fileInput) {
                    const linkInputHasValue = input.value.length > 0;

                    if (linkInputHasValue) {
                        fileInput.disabled = true;
                        if(fileDisplay) fileDisplay.textContent = 'File upload disabled (Link provided)';
                        if (fileInput.files.length > 0) {
                            fileInput.value = ''; // Clear file selection
                        }
                        this.uploadedFileUrl = ''; // Clear uploaded file state
                    } else {
                        fileInput.disabled = this.isUploading;
                        if(fileDisplay) fileDisplay.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : 'Choose File...';
                    }
                }
            },
            
            // --- STEP / FORM FLOW ---

            nextStep: function() {
                // Step 1 Validation
                if (this.submissionStep === 1) {
                    const gradeSelect = document.getElementById('grade-select');
                    const mediumSelect = document.getElementById('medium-select');
                    const typeSelect = document.getElementById('form-type');
                    const subjectSelect = document.getElementById('subject-select');
                    const subjectOtherInput = document.getElementById('subject-other-name');
                    
                    // Check standard selects
                    if (!gradeSelect.value || !mediumSelect.value || !typeSelect.value || !subjectSelect.value) {
                        return window.app.showToast("Please fill all category fields.", "error");
                    }
                    
                    // Check custom subject
                    if (subjectSelect.value === 'Other' && (!subjectOtherInput.value || subjectOtherInput.value.trim() === '')) {
                        window.app.showToast("Please specify the custom subject name.", "error");
                        subjectOtherInput.focus();
                        return;
                    }
                    this.currentStep1Data = {
                        grade: gradeSelect.value,
                        medium: mediumSelect.value,
                        type: typeSelect.value,
                        subject: subjectSelect.value === 'Other' ? subjectOtherInput.value.trim() : subjectSelect.value
                    };
                    
                }
                
                // Step 2 Validation (Critical path: Link OR File)
                if (this.submissionStep === 2) {
                    const linkInput = document.getElementById('resource-link');
                    const fileInput = document.getElementById('file-upload');
                    
                    const linkProvided = linkInput.value.trim().length > 0;
                    const fileProvided = (fileInput && fileInput.files && fileInput.files.length > 0) || this.uploadedFileUrl.length > 0;

                    if (!linkProvided && !fileProvided) {
                        return window.app.showToast("Please provide either a resource link or upload a file.", "error");
                    }
                    if (this.isUploading) {
                        return window.app.showToast("Please wait for the file upload to complete.", "warning");
                    }

                    if (linkProvided) {
                        this.currentManualLink = linkInput.value.trim();
                    }
                }
                
                if (this.submissionStep < 3) {
                    this.submissionStep++;
                    this.renderContribute(document.getElementById('main-content'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            },

            prevStep: function() {
                if (this.submissionStep > 1) {
                    this.submissionStep--;
                    this.renderContribute(document.getElementById('main-content'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            },
            
            submitForm: async function(event) {
                event.preventDefault();
                if (!this.checkDbReady()) return;
                
                const titleInput = document.querySelector('#step-3 [name="title"]');
                if (!titleInput || titleInput.value.trim() === '') {
                    return window.app.showToast("Please enter a title for the resource.", "error");
                }

                const form = event.target;
                const submitBtn = document.getElementById('submit-btn');
                
                submitBtn.disabled = true;
                const originalText = submitBtn.querySelector('#submit-text').textContent;
                submitBtn.querySelector('#submit-text').innerHTML = `<i data-lucide="loader-2" class="h-5 w-5 animate-spin"></i> ${this.t('submitting')}...`;
                lucide.createIcons();

                const formData = new FormData(form);
                const data = {};

                // Capture form fields only for Step 3 details (Title, Description, Author)
                for (let [key, value] of formData.entries()) {
                    data[key] = (typeof value === 'string' ? value : String(value)).trim();
                }

                // CRITICAL FIX: Use state for ALL Step 1 data.
                const savedMetadata = this.currentStep1Data || {}; 
                
                // Final Link/File URL determination (from working logic)
                const finalLink = this.uploadedFileUrl || this.currentManualLink; 
                const requestId = data.requestId;

                if (!finalLink || finalLink.length === 0) {
                    window.app.showToast("Validation failed: No link or file was provided/uploaded.", "error");
                    submitBtn.disabled = false;
                    submitBtn.querySelector('#submit-text').textContent = originalText;
                    lucide.createIcons();
                    return;
                }

                const payload = {
                    title: data.title,
                    description: data.description,
                    
                    // FIX: Metadata must come from the saved state object.
                    grade: savedMetadata.grade || 'Unknown',
                    medium: savedMetadata.medium || 'Unknown',
                    type: savedMetadata.type || 'Unknown',
                    subject: savedMetadata.subject || 'Miscellaneous', 
                    
                    link: finalLink,
                    authorName: data.authorName || 'Anonymous',
                    timestamp: Date.now(),
                    status: 'pending',
                    reportCount: 0,
                    contributorId: this.user ? this.user.uid : 'anon',
                };
                
                try {
                    await addDoc(collection(this.db, 'artifacts', this.appId, 'public', 'data', 'resources'), payload);
                    
                    if (requestId) {
                        await this.deleteRequest(requestId);
                    }

                    // Reset all states on success
                    this.uploadedFileUrl = '';
                    this.isUploading = false;
                    this.fileUploadProgress = 0;
                    this.fulfillmentData = null;
                    this.currentManualLink = ''; 
                    this.currentStep1Data = {}; // Clear Step 1 state on success
                    form.reset();
                    
                    this.formSuccess = true;
                    this.render();
                } catch (e) {
                    console.error("Error submitting resource: ", e);
                    window.app.showToast("Submission Failed. Check console logs.", "error");
                    submitBtn.disabled = false;
                    submitBtn.querySelector('#submit-text').textContent = originalText;
                    lucide.createIcons();
                }
            },
            
            submitRequest: async function(event, modalId) {
                event.preventDefault();
                if (!this.checkDbReady()) return;

                const form = event.target;
                const formData = new FormData(form);
                const data = {};
                for (let [key, value] of formData.entries()) {
                    // FIX: Ensure value is a string before calling trim()
                    data[key] = (typeof value === 'string' ? value : String(value)).trim();
                }

                const payload = {
                    title: data.requestTitle,
                    description: data.requestDescription,
                    grade: data.requestGrade,
                    subject: data.requestSubject === 'Other' ? (data.requestSubjectOther || 'Miscellaneous') : data.requestSubject,
                    medium: data.requestMedium,
                    authorName: data.requestAuthorName || 'Community Member',
                    timestamp: Date.now(),
                    requesterId: this.user ? this.user.uid : 'anon',
                };

                if (!payload.title || !payload.grade || !payload.subject) {
                    return window.app.showToast("Title, Grade, and Subject are required for a request.", "error");
                }
                
                try {
                    await addDoc(collection(this.db, 'artifacts', this.appId, 'public', 'data', 'requests'), payload);
                    document.getElementById(modalId).remove();
                    // FIX: Set form success true so render() displays the success page
                    this.formSuccess = true; 
                    this.render();
                    window.app.showToast(this.t('reqSuccess'), "success");
                } catch (e) {
                    console.error("Error submitting request: ", e);
                    window.app.showToast("Request Submission Failed. Check console logs.", "error");
                }
            },

            // --- FULFILLMENT / CARD ACTIONS ---

            startFulfillment: function(requestId) {
                const request = this.requests.find(r => r.id === requestId);
                if (request) {
                    this.uploadedFileUrl = '';
                    this.isUploading = false;
                    this.fileUploadProgress = 0;
                    
                    let cleanTitle = request.title;
                    // IMPROVEMENT: Clean redundant info from title if user adds it manually
                    const redundantInfo = ` (${request.grade} - ${request.subject})`;
                    if (cleanTitle.endsWith(redundantInfo)) {
                         cleanTitle = cleanTitle.substring(0, cleanTitle.length - redundantInfo.length);
                    }

                    this.fulfillmentData = {
                        title: cleanTitle,
                        grade: request.grade,
                        subject: request.subject,
                        medium: request.medium,
                        requestId: requestId
                    };
                    this.submissionStep = 1;
                    this.setPage('contribute');
                } else {
                    window.app.showToast("Request not found.", "error");
                }
            },
            
            toggleSaved: function(id) {
                const index = this.savedIds.indexOf(id);
                if (index > -1) {
                    this.savedIds.splice(index, 1);
                    window.app.showToast("Removed from Library", "info");
                } else {
                    this.savedIds.push(id);
                    window.app.showToast("Added to Library", "success");
                }
                localStorage.setItem('nenaMagaSaved', JSON.stringify(this.savedIds));
                this.render();
            },
            
            reportResource: async function(id) {
                if (!this.checkDbReady()) return;
                
                try {
                    const docRef = doc(this.db, 'artifacts', this.appId, 'public', 'data', 'resources', id);
                    await updateDoc(docRef, {
                        reportCount: increment(1)
                    });
                    window.app.showToast(this.t('reported'), "info");
                    this.render();
                } catch (e) {
                    console.error("Error reporting resource: ", e);
                    window.app.showToast("Report failed.", "error");
                }
            },
            
            showDeleteConfirmation: function(id, title) {
                const t = this.t.bind(this);
                const modal = document.getElementById('modal-container');
                const modalId = 'delete-modal';
                modal.innerHTML = `
                    <div id="${modalId}" class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-fade-in">
                        <div class="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl w-full max-w-sm relative transform transition-all scale-100 border border-white/20">
                            <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-5 right-5 text-slate-400 hover:text-slate-600"><i data-lucide="x"></i></button>
                            <div class="text-center mb-6">
                                <div class="inline-flex p-4 bg-red-100 dark:bg-red-900/40 rounded-full mb-5 text-red-600 shadow-sm ring-1 ring-red-500/10"><i data-lucide="alert-triangle" class="h-8 w-8"></i></div>
                                <h3 class="text-xl font-bold font-display text-slate-900 dark:text-white">Confirm Deletion</h3>
                                <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">${t('confirmDelete')}: <strong>${escapeHTML(title)}</strong>?</p>
                            </div>
                            <div class="flex gap-3 mt-6">
                                <button onclick="document.getElementById('${modalId}').remove()" class="w-1/2 py-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300 transition">Cancel</button>
                                <button onclick="window.app.adminAction('${id}', 'delete', true); document.getElementById('${modalId}').remove();" class="w-1/2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition">Delete Permanently</button>
                            </div>
                        </div>
                    </div>
                `;
                lucide.createIcons();
            },

            adminAction: async function(id, action, confirmed = false) {
                if (!this.checkDbReady() || !this.isAdmin) return;

                const docRef = doc(this.db, 'artifacts', this.appId, 'public', 'data', 'resources', id);
                const resource = this.resources.find(r => r.id === id);
                if (!resource) return;

                if (action === 'delete' && !confirmed) {
                    this.showDeleteConfirmation(id, resource.title);
                    return;
                }
                
                try {
                    if (action === 'approve') {
                        await updateDoc(docRef, { status: 'approved', reportCount: 0 });
                        window.app.showToast("Resource Approved! Live now.", "success");
                    } else if (action === 'reject') {
                        await updateDoc(docRef, { status: 'rejected' });
                        window.app.showToast("Resource Rejected (Hidden).", "info");
                    } else if (action === 'delete') {
                        // FIX: Integrated robust storage file deletion
                        if (resource.link && resource.link.includes('firebasestorage.googleapis.com')) {
                           await this.deleteStorageFileByDownloadURL(resource.link);
                        }

                        await deleteDoc(docRef);
                        window.app.showToast("Resource permanently deleted.", "warning");
                    } else if (action === 'autoHide') {
                        await updateDoc(docRef, { status: 'rejected', reportCount: 0 });
                        window.app.showToast("Resource manually hidden (Flag cleared).", "warning");
                    }
                    this.render();
                } catch (e) {
                    console.error(`Error performing ${action} action: `, e);
                    window.app.showToast(`Action '${action}' failed.`, "error");
                }
            },


            // --- UI RENDERING CORE ---

            render: function() {
                const main = document.getElementById('main-content');
                main.innerHTML = '';
                
                // Update navigation translations and styles
                document.getElementById('app-title').innerText = this.t('appTitle');
                document.getElementById('nav-app-name').innerText = this.t('appName');
                document.getElementById('nav-tagline').innerText = this.t('appTagline');
                document.getElementById('footer-app-name').innerText = this.t('appName');
                document.querySelectorAll('[data-t]').forEach(el => el.innerText = this.t(el.getAttribute('data-t')));
                
                const adminDisplay = this.isAdmin ? 'flex' : 'none';
                document.getElementById('admin-nav-btn').style.display = adminDisplay;
                document.getElementById('mobile-admin-btn').style.display = adminDisplay;

                if (this.page === 'home') this.renderHome(main);
                else if (this.page === 'saved') this.renderSaved(main);
                else if (this.page === 'contribute') {
                    if (this.formSuccess) this.renderSuccess(main, 'resource');
                    else this.renderContribute(main);
                }
                else if (this.page === 'request') {
                     if (this.formSuccess) this.renderSuccess(main, 'request');
                     else this.renderRequests(main);
                }
                else if (this.page === 'admin') this.renderAdmin(main);

                lucide.createIcons();
            },
            
            // --- RENDER IMPLEMENTATION FUNCTIONS ---

            getSkeletonHTML: function() {
                return Array(6).fill(0).map(() => `
                    <div class="glass-card rounded-3xl p-6 shadow-lg animate-pulse h-full">
                        <div class="flex justify-between mb-4">
                            <div class="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                            <div class="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                        <div class="h-7 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
                        <div class="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
                        <div class="space-y-3 mb-8">
                            <div class="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div class="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                        <div class="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                    </div>
                `).join('');
            },

            renderSelect: function(key, options, defaultLabel) {
                const isActive = this.filters[key] !== 'All';
                return `
                <div class="relative">
                    <select onchange="window.app.updateFilter('${key}', this.value)" class="w-full appearance-none py-3.5 px-6 ${isActive ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-bold border-brand-200 dark:border-brand-700' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-medium border-transparent'} border rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition cursor-pointer pr-12 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <option value="All">${defaultLabel}</option>
                        ${options.map(o => `<option value="${o}" ${this.filters[key] === o ? 'selected' : ''}>${o}</option>`).join('')}
                    </select>
                    <i data-lucide="chevron-down" class="absolute right-5 top-4 h-4 w-4 text-slate-400 pointer-events-none"></i>
                </div>`;
            },
            
            renderHome: function(container) {
                container.innerHTML = `
                    <div class="py-8 px-4 md:px-0 animate-slide-up">
                        <div class="relative bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] rounded-[2.5rem] p-8 md:p-14 mb-10 text-white shadow-2xl overflow-hidden isolate ring-1 ring-white/10 group">
                            <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div class="hidden md:block absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-500 rounded-full opacity-20 blur-[80px] group-hover:opacity-30 transition duration-1000"></div>
                            <div class="hidden md:block absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-pink-500 rounded-full opacity-20 blur-[80px] group-hover:opacity-30 transition duration-1000"></div>
                            
                            <div class="relative z-10 max-w-4xl">
                                <div class="inline-flex items-center bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest text-brand-200 shadow-xl mb-6 hover:bg-white/20 transition cursor-default">
                                    <i data-lucide="sparkles" class="h-3.5 w-3.5 mr-2 text-yellow-300 fill-yellow-300 animate-pulse"></i> 100% Free
                                </div>
                                <h1 class="text-4xl md:text-6xl lg:text-7xl font-display font-black mb-6 leading-tight tracking-tight whitespace-pre-line drop-shadow-sm">${this.t('heroTitle')}</h1>
                                <p class="text-brand-100 text-base md:text-xl mb-10 leading-relaxed max-w-2xl font-light opacity-90">${this.t('heroSubtitle')}</p>
                                <div class="flex flex-wrap gap-4">
                                    <button data-nav-page="contribute" class="group bg-white text-brand-900 font-bold py-4 px-8 rounded-2xl shadow-xl shadow-brand-900/20 hover:bg-brand-50 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center text-base md:text-lg">
                                        <i data-lucide="upload" class="h-5 w-5 mr-3 group-hover:scale-110 transition"></i> ${this.t('contribute')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="glass p-3 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-white/50 dark:border-slate-700/50 mb-10 z-[30] transition-all">
                            <div class="flex flex-col gap-3">
                                <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div class="relative group">
                                        <i data-lucide="search" class="absolute left-5 top-4 h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition"></i>
                                        <input type="text" placeholder="${this.t('searchPlaceholder')}" value="${this.search}" id="search-input" class="w-full pl-14 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-brand-500/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition font-medium text-slate-700 dark:text-white placeholder-slate-400"/>
                                    </div>
                                    ${this.renderSelect('grade', GRADES, this.t('allGrades'))}
                                    ${this.renderSelect('subject', SUBJECTS, this.t('allSubjects'))}
                                    ${this.renderSelect('medium', MEDIUMS, this.t('allMediums'))}
                                </div>
                                <div class="flex justify-end px-1">
                                    <select onchange="window.app.updateSort(this.value)" class="text-sm font-semibold bg-transparent text-slate-500 dark:text-slate-400 focus:outline-none cursor-pointer hover:text-brand-600 transition">
                                        <option value="newest" ${this.sortBy === 'newest' ? 'selected' : ''}>${this.t('sortNewest')}</option>
                                        <option value="oldest" ${this.sortBy === 'oldest' ? 'selected' : ''}>${this.t('sortOldest')}</option>
                                        <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>${this.t('sortName')}</option>
                                    </select>
                                    <button onclick="window.app.clearFilters()" class="text-xs text-slate-400 hover:text-brand-500 ml-4">${this.t('clearFilters')}</button>
                                </div>
                            </div>
                        </div>

                        <div id="resource-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            ${this.isLoading ? this.getSkeletonHTML() : ''}
                        </div>
                    </div>
                `;
                document.getElementById('search-input')?.addEventListener('input', (e) => window.app.updateSearch(e.target.value));

                if(!this.isLoading) this.renderGrid(document.getElementById('resource-grid'));
            },

            renderGrid: function(container) {
                let filtered = this.resources.filter(r => {
                    // Only show approved resources by default
                    if (r.status !== 'approved' && !this.isAdmin) return false; 
                    
                    // Hide reported resources (5+ reports) from non-admins
                    if (r.reportCount >= 5 && !this.isAdmin) return false;

                    const q = this.search.toLowerCase();
                    
                    const matchesSearch = 
                        r.title.toLowerCase().includes(q) || 
                        (r.subject && r.subject.toLowerCase().includes(q)) || 
                        (r.description && r.description.toLowerCase().includes(q));

                    return matchesSearch && 
                           (this.filters.grade === 'All' || r.grade === this.filters.grade) && 
                           (this.filters.subject === 'All' || (r.subject && r.subject === this.filters.subject)) &&
                           (this.filters.medium === 'All' || r.medium === this.filters.medium);
                });

                filtered.sort((a, b) => {
                    if (this.sortBy === 'newest') return b.timestamp - a.timestamp;
                    if (this.sortBy === 'oldest') return a.timestamp - b.timestamp;
                    if (this.sortBy === 'name') return a.title.localeCompare(b.title);
                    return 0;
                });

                if (filtered.length === 0) {
                    container.innerHTML = `
                        <div class="col-span-full py-24 text-center">
                            <div class="bg-slate-50 dark:bg-slate-800/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <i data-lucide="search-x" class="h-10 w-10 text-slate-400"></i>
                            </div>
                            <h3 class="text-2xl font-bold text-slate-800 dark:text-white mb-2 font-display">${this.t('noResults')}</h3>
                            <p class="text-slate-500 dark:text-slate-400 mb-6">Try adjusting your filters or search terms.</p>
                            <button onclick="window.app.clearFilters()" class="text-brand-600 dark:text-brand-400 font-bold hover:underline">${this.t('clearFilters')}</button>
                        </div>`;
                    return;
                }

                container.innerHTML = filtered.map(r => this.createCardHTML(r)).join('');
                lucide.createIcons();
            },
            
            // --- FILTER / SORT LOGIC ---

            updateFilter: function(key, val) {
                this.filters[key] = val;
                this.render();
            },

            updateSearch: function(val) {
                this.search = val;
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => this.render(), 300);
            },

            updateSort: function(val) {
                this.sortBy = val;
                this.render();
            },

            clearFilters: function() {
                this.search = '';
                this.filters = { grade: 'All', subject: 'All', medium: 'All' };
                this.sortBy = 'newest';
                this.render();
            },
            
            // --- RESOURCE CARD RENDERING ---

            createCardHTML: function(r) {
                const isSaved = this.savedIds.includes(r.id);
                const isVideo = r.type === 'Video Lesson' || (r.link && (r.link.toLowerCase().includes('youtube.com') || r.link.toLowerCase().includes('youtu.be')));
                
                const statusBadge = r.status === 'pending' ? `<span class="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">${this.t('pending')}</span>` : 
                                     r.reportCount >= 5 ? `<span class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center"><i data-lucide="flag" class="h-3 w-3 mr-1 fill-red-700/50"></i> ${r.reportCount} Reports</span>` :
                                     r.status === 'approved' ? `<span class="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center"><i data-lucide="check-circle" class="h-3 w-3 mr-1 fill-emerald-700/50"></i> ${this.t('verifiedBadge')}</span>` : 
                                     '';
                
                const safeLink = sanitizeURL(r.link);
                const actionButton = isVideo 
                    ? `<a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/20 transition-all flex justify-center items-center gap-2"><i data-lucide="play-circle" class="h-5 w-5 fill-white"></i> ${this.t('watchBtn')}</a>`
                    : `<a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-500/20 transition-all flex justify-center items-center gap-2"><i data-lucide="download" class="h-5 w-5"></i> ${this.t('accessBtn')}</a>`;

                const adminActions = this.isAdmin ? `
                    <div class="flex flex-wrap gap-2 text-xs font-medium mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        ${r.status === 'pending' || r.status === 'rejected' ? `<button onclick="window.app.adminAction('${r.id}', 'approve')" class="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-3 py-1 rounded-lg">${this.t('approve')}</button>` : ''}
                        ${r.status === 'approved' && r.reportCount < 5 ? `<button onclick="window.app.adminAction('${r.id}', 'reject')" class="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-1 rounded-lg">Hide</button>` : ''}
                        ${r.reportCount >= 5 ? `<button onclick="window.app.adminAction('${r.id}', 'autoHide')" class="text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 px-3 py-1 rounded-lg">${this.t('autoHidden')}</button>` : ''}
                        <button onclick="window.app.adminAction('${r.id}', 'delete')" class="text-slate-500 hover:text-red-500 px-3 py-1 rounded-lg ml-auto"><i data-lucide="trash-2" class="h-4 w-4"></i></button>
                    </div>
                ` : '';
                
                return `
                    <div class="glass-card rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:ring-4 hover:ring-brand-500/10 transition duration-300">
                        <div>
                            <div class="flex justify-between items-start mb-4">
                                <div class="flex flex-wrap gap-2">
                                    <span class="bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 px-3 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wide border border-brand-100 dark:border-brand-800/50">${escapeHTML(r.grade)}</span>
                                    ${statusBadge}
                                </div>
                                <button onclick="window.app.toggleSaved('${r.id}')" class="p-2 rounded-full transition-colors active:scale-90 ${isSaved ? 'text-pink-500 hover:text-pink-600 fill-pink-500' : 'text-slate-400 hover:text-pink-500 hover:fill-pink-500/30'}">
                                    <i data-lucide="heart" class="h-5 w-5 ${isSaved ? 'fill-current' : ''}"></i>
                                </button>
                            </div>

                            <h3 class="text-xl font-display font-bold text-slate-900 dark:text-white mb-2 leading-snug">${escapeHTML(r.title)}</h3>
                            <div class="flex flex-wrap gap-2 mb-4">
                                <span class="text-xs font-semibold text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/50">${escapeHTML(r.subject)}</span>
                                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">${escapeHTML(r.medium)}</span>
                            </div>

                            <p class="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-3">${escapeHTML(r.description || r.type)}</p>
                        </div>
                        
                        <div class="mt-auto">
                            <div class="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 mb-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-100 to-indigo-100 dark:from-brand-900/50 dark:to-indigo-900/50 flex items-center justify-center mr-2 text-brand-600 dark:text-brand-300 font-bold text-[10px] shadow-sm uppercase">${escapeHTML((r.authorName || 'Anonymous').charAt(0))}</div>
                                <span class="font-semibold text-slate-700 dark:text-slate-300">${escapeHTML(r.authorName || 'Anonymous')}</span>
                            </div>
                            ${actionButton}
                            ${this.isAdmin ? adminActions : ''}
                            ${!this.isAdmin && r.status === 'approved' ? `<button onclick="window.app.reportResource('${r.id}')" class="w-full mt-3 text-xs text-red-500 hover:text-red-700 hover:underline flex items-center justify-center gap-1"><i data-lucide="flag" class="h-3 w-3"></i> ${this.t('report')}</button>` : ''}
                        </div>
                    </div>
                `;
            },
            
            // --- SAVED & SUCCESS PAGES ---

            renderSaved: function(container) {
                container.innerHTML = `
                    <div class="py-8 px-4 animate-slide-up">
                        <div class="flex items-center mb-10">
                            <div class="p-3.5 bg-pink-100 dark:bg-pink-900/30 rounded-2xl mr-5 shadow-sm"><i data-lucide="heart" class="h-7 w-7 text-pink-600 dark:text-pink-400 fill-pink-600/20"></i></div>
                            <h2 class="text-3xl font-display font-bold text-slate-900 dark:text-white">${this.t('saved')}</h2>
                        </div>
                        <div id="saved-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"></div>
                    </div>`;
                const saved = this.resources.filter(r => this.savedIds.includes(r.id));
                const grid = document.getElementById('saved-grid');
                if (saved.length === 0) grid.innerHTML = `<div class="col-span-full text-center py-24 text-slate-400 italic bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">${this.t('noSaved')} <br><span class="text-sm not-italic mt-3 block opacity-70 font-semibold text-brand-600 dark:text-brand-400">${this.t('saveHint')}</span></div>`;
                else grid.innerHTML = saved.map(r => this.createCardHTML(r)).join('');
                lucide.createIcons();
            },

            renderSuccess: function(container, type) {
                const successMsg = type === 'resource' ? this.t('successMsg') : this.t('reqSuccessMsg');
                const waitMsg = this.t('waitMsg');
                container.innerHTML = `
                    <div class="py-20 px-4 animate-slide-up flex justify-center">
                        <div class="w-full max-w-xl glass-card p-10 rounded-[2.5rem] shadow-2xl relative text-center">
                            <div class="inline-flex p-5 bg-emerald-100 dark:bg-emerald-900/40 rounded-full mb-6 text-emerald-600 shadow-xl ring-4 ring-emerald-500/10 dark:ring-emerald-500/10">
                                <i data-lucide="check-circle" class="h-10 w-10"></i>
                            </div>
                            <h2 class="text-3xl font-display font-bold text-slate-900 dark:text-white mb-3">${this.t('thankYou')}</h2>
                            <p class="text-slate-600 dark:text-slate-300 text-lg mb-4">${successMsg}</p>
                            ${type === 'resource' ? `<p class="text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-900/20 inline-block px-4 py-2 rounded-full">${waitMsg}</p>` : ''}
                            <button data-nav-page="home" class="mt-8 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition">Go Back Home</button>
                        </div>
                    </div>
                `;
                // formSuccess is now cleared by navigation, not immediately after render
                lucide.createIcons();
            },

            renderContribute: function(container) {
                const isFileUploaded = !!this.uploadedFileUrl;
                let uploadFileName = 'No file selected';
                const fileInput = document.getElementById('file-upload');
                if (fileInput && fileInput.files && fileInput.files.length > 0) {
                    uploadFileName = fileInput.files[0].name;
                }
                
                const fulfillment = this.fulfillmentData || {};
                const defaultTitle = fulfillment.title || ''; 
                // IMPROVEMENT: Use the fulfillment data defaults
                const defaultGrade = fulfillment.grade || GRADES[0]; 
                const defaultSubject = fulfillment.subject || SUBJECTS[0]; 
                const defaultMedium = fulfillment.medium || MEDIUMS[0]; 
                const isFulfilling = !!fulfillment.requestId;

                // Determine if the fulfillment subject is a custom one not in the list
                const isCustomSubject = !SUBJECTS.includes(defaultSubject);
                const initialSubject = isCustomSubject ? 'Other' : defaultSubject;
                const showOtherSubject = initialSubject === 'Other';
                const customSubjectValue = isCustomSubject ? defaultSubject : '';

                // Link disabled if a file is uploaded or is currently uploading or if a file is selected
                const linkInputVal = document.getElementById('resource-link') ? document.getElementById('resource-link').value.length > 0 : false;
                const fileSelected = fileInput && fileInput.files && fileInput.files.length > 0;
                const isLinkDisabled = isFileUploaded || this.isUploading || fileSelected;
                
                // File disabled if a link is entered or is currently uploading or if a link is provided
                const isFileDisabled = linkInputVal || this.isUploading;
                
                const steps = [
                    { title: "Metadata", icon: "clipboard-list", step: 1 },
                    { title: "Upload / Link", icon: "link-2", step: 2 },
                    { title: "Details", icon: "edit-3", step: 3 }
                ];
                
                const currentStep = this.submissionStep;

                container.innerHTML = `
                    <div class="py-12 px-4 animate-slide-up">
                        <div class="w-full relative"> 
                            <div class="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                            <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

                            <div class="glass-card p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/40 dark:border-slate-700/40 max-w-4xl mx-auto">
                                <div class="text-center mb-10">
                                    <div class="inline-flex p-4 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/40 dark:to-brand-800/40 rounded-2xl mb-5 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-brand-500/10"><i data-lucide="upload-cloud" class="h-8 w-8"></i></div>
                                    <h2 class="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">${this.t('submitTitle')}</h2>
                                    ${isFulfilling ? `<p class="text-lg font-bold text-orange-500 dark:text-orange-400 mb-3 border-b-2 border-dashed border-orange-200 pb-2">Fulfilling Request ID: ${fulfillment.requestId.substring(0, 8)}...</p>` : ''}
                                    <p class="text-slate-500 dark:text-slate-400 text-base max-w-sm mx-auto">${this.t('submitSubtitle')}</p>
                                </div>
                                
                                <div class="flex justify-between items-center mb-10 space-x-2 relative">
                                    ${steps.map(s => `
                                    <div class="flex flex-col items-center flex-1">
                                        <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${s.step <= currentStep ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}">
                                            ${s.step}
                                        </div>
                                        <span class="text-xs mt-2 text-center font-medium ${s.step <= currentStep ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500'} hidden sm:block">${s.title}</span>
                                    </div>
                                    `).join('')}
                                    <div class="absolute top-[20px] left-0 right-0 h-0.5 -z-10 flex justify-between px-16">
                                        <div class="h-full w-full bg-slate-200 dark:bg-slate-700 absolute"></div>
                                        <div class="h-full absolute bg-brand-600 transition-all duration-500 ease-in-out" style="width: ${((currentStep - 1) / (steps.length - 1)) * 100}%;"></div>
                                    </div>
                                </div>
                                
                                <form id="contribute-form" onsubmit="window.app.submitForm(event)" class="space-y-6">
                                    <input type="hidden" name="requestId" value="${fulfillment.requestId || ''}">
                                    
                                    <div id="step-1" class="${currentStep === 1 ? '' : 'hidden'} animate-fade-in space-y-6">
                                        <h3 class="form-group-label !text-base !font-semibold !uppercase !mb-4 text-slate-700 dark:text-slate-200">1. Select Resource Category</h3>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div class="space-y-1.5 w-full">
                                                <label class="form-group-label" for="grade-select">${this.t('formGrade')}</label>
                                                <div class="relative group">
                                                    <i data-lucide="graduation-cap" class="h-5 w-5 group-focus-within:text-brand-500 transition-colors form-group-icon-wrapper"></i>
                                                    <select id="grade-select" name="grade" required class="form-select-clean appearance-none">${GRADES.map(g => `<option value="${g}" ${defaultGrade === g ? 'selected' : ''}>${g}</option>`).join('')}</select>
                                                    <i data-lucide="chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"></i>
                                                </div>
                                            </div>
                                            <div class="space-y-1.5 w-full">
                                                <label class="form-group-label" for="medium-select">${this.t('formMedium')}</label>
                                                <div class="relative group">
                                                    <i data-lucide="languages" class="h-5 w-5 group-focus-within:text-brand-500 transition-colors form-group-icon-wrapper"></i>
                                                    <select id="medium-select" name="medium" required class="form-select-clean appearance-none">${MEDIUMS.map(m => `<option value="${m}" ${defaultMedium === m ? 'selected' : ''}>${m}</option>`).join('')}</select>
                                                    <i data-lucide="chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"></i>
                                                </div>
                                            </div>
                                            <div class="space-y-1.5 w-full">
                                                <label class="form-group-label" for="subject-select">${this.t('formSubject')}</label>
                                                <div class="relative group">
                                                    <i data-lucide="book" class="h-5 w-5 group-focus-within:text-brand-500 transition-colors form-group-icon-wrapper"></i>
                                                    <select id="subject-select" name="subject" required onchange="window.app.handleSubjectChange(this.value)" class="form-select-clean appearance-none cursor-pointer">
                                                        ${SUBJECTS.map(s => `<option value="${s}">${s}</option>`).join('')}
                                                        <option value="Other">--- Other ---</option>
                                                    </select>
                                                    <i data-lucide="chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"></i>
                                                </div>
                                            </div>
                                            <div class="space-y-1.5 w-full">
                                                <label class="form-group-label" for="form-type">${this.t('formType')}</label>
                                                <div class="relative group">
                                                    <i data-lucide="file-type" class="h-5 w-5 group-focus-within:text-brand-500 transition-colors form-group-icon-wrapper"></i>
                                                    <select id="form-type" name="type" required class="form-select-clean appearance-none cursor-pointer">${TYPES.map(t => `<option>${t}</option>`).join('')}</select>
                                                    <i data-lucide="chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="space-y-1.5 w-full ${showOtherSubject ? '' : 'hidden'}" id="subject-other-input">
                                            <label class="form-group-label">Other Subject Name</label>
                                            <div class="relative group">
                                                <i data-lucide="pencil" class="h-5 w-5 group-focus-within:text-brand-500 transition-colors form-group-icon-wrapper"></i>
                                                <input name="subject_other" id="subject-other-name" type="text" class="form-input-clean placeholder-slate-400" placeholder="Enter custom subject name" value="${customSubjectValue}" ${showOtherSubject ? 'required' : ''}>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div id="step-2" class="${currentStep === 2 ? '' : 'hidden'} animate-fade-in space-y-6">
                                        <h3 class="form-group-label !text-base !font-semibold !uppercase !mb-4 text-slate-700 dark:text-slate-200">2. Provide Resource File or Link (One Required)</h3>
                                        
                                        <div class="space-y-1.5 w-full">
                                            <label class="form-group-label">${this.t('formLink')}</label>
                                            <div class="relative group">
                                                <i data-lucide="link" class="h-5 w-5 group-focus-within:text-brand-500 transition-colors form-group-icon-wrapper"></i>
                                                <input id="resource-link" name="manualLink" type="url" ${isLinkDisabled ? 'disabled' : ''} oninput="window.app.checkLink(this)" class="form-input-clean placeholder-slate-400 transition-all duration-300 ${isLinkDisabled ? 'opacity-50 cursor-not-allowed' : ''}" style="width: 100%;" placeholder="Paste Google Drive or YouTube link here..." value="${this.currentManualLink}">
                                                <div id="video-badge" class="absolute right-3 top-1/2 -translate-y-1/2 ${this.uploadedFileUrl.includes('youtube.com') || this.uploadedFileUrl.includes('youtu.be') ? 'flex' : 'hidden'} bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg items-center animate-fade-in pointer-events-none"><i data-lucide="play-circle" class="h-3 w-3 mr-1 fill-current"></i> Video</div>
                                            </div>
                                        </div>

                                        <div class="flex items-center text-xs uppercase text-slate-400 dark:text-slate-500 font-bold gap-3">
                                            <div class="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                                            OR
                                            <div class="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                                        </div>
                                        
                                        <div class="space-y-1.5 w-full" id="file-upload-wrapper">
                                            <label class="form-group-label flex justify-between items-center">
                                                ${this.t('formFile')}
                                                <span class="text-[10px] text-slate-400 normal-case font-medium ml-2">Max 20MB (PDF, DOCX, JPG)</span>
                                            </label>
                                            <div class="relative group">
                                                <input type="file" id="file-upload" name="file-upload" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onchange="window.app.handleFileUpload(this)" class="absolute inset-0 opacity-0 cursor-pointer" ${isFileDisabled ? 'disabled' : ''}>
                                                
                                                <div class="form-input-clean ${isFileDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} flex items-center justify-between !pl-4 !pr-4" style="width: 100%;" onclick="document.getElementById('file-upload').click()">
                                                    <span id="file-text-display" class="truncate text-slate-500 dark:text-slate-400 font-medium">
                                                        ${this.isUploading ? `${this.t('uploadProgress')} (<span id="upload-progress-text">${this.fileUploadProgress}</span>%)` : isFileUploaded || fileSelected ? `<i data-lucide="check-circle" class="h-4 w-4 text-emerald-500 mr-2"></i> File Ready: ${uploadFileName}` : 'Choose File...'}
                                                    </span>
                                                    <i data-lucide="file-text" class="h-5 w-5 text-brand-600 dark:text-brand-400"></i>
                                                </div>
                                                
                                                ${this.isUploading ? `
                                                    <div class="absolute bottom-0 left-0 w-full h-1 bg-brand-200 dark:bg-brand-900 rounded-b-xl overflow-hidden">
                                                        <div id="upload-progress-bar" class="h-full bg-brand-600 transition-all duration-300" style="width: ${this.fileUploadProgress}%;"></div>
                                                    </div>
                                                ` : ''}
                                            </div>
                                            
                                            ${isFileUploaded ? `<p class="text-xs text-emerald-600 dark:text-emerald-400 ml-1 mt-1 font-semibold flex items-center"><i data-lucide="check" class="h-3 w-3 mr-1"></i> Uploaded URL: ${this.uploadedFileUrl.substring(0, 50)}...</p>` : ''}
                                            
                                        </div>
                                    </div>
                                    
                                    <div id="step-3" class="${currentStep === 3 ? '' : 'hidden'} animate-fade-in space-y-6">
                                        <h3 class="form-group-label !text-base !font-semibold !uppercase !mb-4 text-slate-700 dark:text-slate-200">3. Final Details</h3>
                                        <div class="space-y-1.5 w-full">
                                            <label class="form-group-label">${this.t('formTitle')}</label>
                                            <div class="relative group">
                                                <i data-lucide="type" class="h-5 w-5 group-focus-within:text-brand-500 transition-colors form-group-icon-wrapper"></i>
                                                <input required name="title" type="text" class="form-input-clean placeholder-slate-400" value="${defaultTitle}" style="width: 100%;" placeholder="e.g. 2023 Combined Maths Past Paper">
                                            </div>
                                        </div>

                                        <div class="space-y-1.5 w-full">
                                            <label class="form-group-label">Description <span class="normal-case font-normal opacity-50">(Optional)</span></label>
                                            <div class="relative group">
                                                <i data-lucide="align-left" class="h-5 w-5 group-focus-within:text-brand-500 transition-colors form-group-icon-wrapper"></i>
                                                <textarea name="description" rows="3" class="form-input-clean" placeholder="Add any extra details about this resource..."></textarea>
                                            </div>
                                        </div>

                                        <div class="space-y-1.5 w-full">
                                            <label class="form-group-label">Contributor Name <span class="normal-case font-normal opacity-50">(Optional)</span></label>
                                            <div class="relative group">
                                                <i data-lucide="user" class="h-5 w-5 group-focus-within:text-brand-500 transition-colors form-group-icon-wrapper"></i>
                                                <input name="authorName" type="text" class="form-input-clean placeholder-slate-400" style="width: 100%;" placeholder="Your name or nickname">
                                            </div>
                                        </div>

                                        <button id="submit-btn" type="submit" ${this.isUploading ? 'disabled' : ''} class="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-8 flex justify-center items-center gap-2 text-base tracking-wide">
                                            <span id="submit-text">${this.t('submitBtn')}</span> <i data-lucide="arrow-right" class="h-5 w-5"></i>
                                        </button>
                                    </div>
                                </form>
                                
                                <div class="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-700/50 mt-8">
                                    <button onclick="window.app.prevStep()" ${currentStep === 1 ? 'disabled' : ''} class="flex items-center text-slate-500 dark:text-slate-400 hover:text-brand-600 transition ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}">
                                        <i data-lucide="arrow-left" class="h-5 w-5 mr-2"></i> Previous
                                    </button>
                                    <button onclick="window.app.nextStep()" ${currentStep === 3 ? 'disabled' : ''} class="flex items-center text-brand-600 dark:text-brand-400 font-bold hover:text-brand-700 transition ${currentStep === 3 ? 'opacity-50 cursor-not-allowed' : ''}">
                                        Next <i data-lucide="arrow-right" class="h-5 w-5 ml-2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Re-creating the change handler and setting initial values after rendering
                const subjectSelect = document.getElementById('subject-select');
                if (subjectSelect) {
                    subjectSelect.value = initialSubject; // Use corrected value for the selector
                    subjectSelect.addEventListener('change', (e) => this.handleSubjectChange(e.target.value));
                    this.handleSubjectChange(initialSubject); // Run once to correctly show/hide other subject field
                }

                const linkInput = document.getElementById('resource-link');
                if (linkInput) {
                    linkInput.addEventListener('input', (e) => this.checkLink(e.target));
                    this.checkLink(linkInput); // Initial link check
                }
                
                lucide.createIcons();
            },

            renderRequests: function(container) {
                let sortedRequests = [...this.requests];
                sortedRequests.sort((a,b) => b.timestamp - a.timestamp);

                container.innerHTML = `
                    <div class="py-8 px-4 animate-slide-up">
                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                            <div>
                                <h2 class="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">${this.t('requestTabTitle')}</h2>
                                <p class="text-slate-500 dark:text-slate-400 text-lg">${this.t('requestSubtitle')}</p>
                            </div>
                            <button onclick="window.app.showRequestModal()" class="bg-orange-500 hover:bg-orange-600 text-white px-7 py-3.5 rounded-2xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition hover:-translate-y-1 flex items-center"><i data-lucide="plus" class="h-5 w-5 mr-2"></i> ${this.t('requestBtn')}</button>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            ${sortedRequests.length === 0 ? `<div class="col-span-full text-center py-20 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 italic">No active requests.</div>` : 
                            sortedRequests.map(r => `
                                <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 flex flex-col justify-between hover:border-orange-300 dark:hover:border-orange-800 hover:shadow-lg transition-all duration-300 group h-full">
                                    <div>
                                        <div class="flex justify-between items-start mb-4">
                                            <div class="flex gap-2">
                                                <span class="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wide border border-orange-100 dark:border-orange-800/50">${escapeHTML(r.grade)}</span>
                                                <span class="text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-slate-700">${escapeHTML(r.subject)}</span>
                                            </div>
                                            <span class="text-xs font-medium text-slate-400">${new Date(r.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <h3 class="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">${escapeHTML(r.title)}</h3>
                                        <p class="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">${escapeHTML(r.description || 'No specific details provided.')}</p>
                                    </div>
                                    <div class="pt-5 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center mt-auto">
                                        <div class="flex items-center text-xs font-medium text-slate-500">
                                            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900 flex items-center justify-center mr-3 text-orange-600 dark:text-orange-300 font-bold shadow-sm">${escapeHTML((r.authorName || 'U').charAt(0))}</div>
                                            ${escapeHTML(r.authorName || 'User')}
                                        </div>
                                        <button onclick="window.app.startFulfillment('${r.id}')" class="text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-4 py-2 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/40 transition">${this.t('fulfillBtn')}</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                lucide.createIcons();
            },

            renderAdmin: function(container) {
                const pending = this.resources.filter(r => r.status === 'pending' || r.reportCount >= 5 || r.status === 'rejected');
                
                // Sort by report count descending, then by pending status, then by newest
                pending.sort((a, b) => {
                    if (b.reportCount !== a.reportCount) return b.reportCount - a.reportCount;
                    if (a.status === 'pending' && b.status !== 'pending') return -1;
                    if (b.status === 'pending' && a.status !== 'pending') return 1;
                    return b.timestamp - a.timestamp;
                });
                
                container.innerHTML = `
                    <div class="py-8 px-4 animate-slide-up">
                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h2 class="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center"><i data-lucide="shield-check" class="h-8 w-8 mr-4 text-emerald-500"></i> ${this.t('dashboard')}</h2>
                            <div class="flex space-x-3 mt-4 md:mt-0">
                                <button onclick="window.app.logoutAdmin()" class="text-slate-500 hover:text-red-600 font-medium text-sm md:text-base px-6 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition border border-slate-200 dark:border-slate-700 hover:border-red-200">Logout</button>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            ${pending.length === 0 ? `
                                <div class="col-span-full text-center py-24 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700">
                                    <div class="bg-emerald-50 dark:bg-emerald-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i data-lucide="check-circle-2" class="h-10 w-10 text-emerald-500"></i>
                                    </div>
                                    <h3 class="text-xl font-bold text-slate-800 dark:text-white">All caught up!</h3>
                                    <p class="text-slate-400 mt-2">No items pending review.</p>
                                </div>` : 
                            pending.map(r => this.createCardHTML(r)).join('')}
                        </div>
                    </div>
                `;
                lucide.createIcons();
            },
            
            showAppInfoModal: function(type) {
                const t = this.t.bind(this);
                const modal = document.getElementById('modal-container');
                const modalId = 'info-modal';

                let title = t(`footer${type.charAt(0).toUpperCase() + type.slice(1)}`);
                let content = '';
                let icon = '';
                const langContent = MODAL_CONTENT[this.lang] || MODAL_CONTENT.en;

                if (type === 'about') {
                    icon = 'info';
                    content = langContent.about;
                } else if (type === 'contact') {
                    icon = 'mail';
                    content = langContent.contact;
                }

                modal.innerHTML = `
                    <div id="${modalId}" class="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fade-in">
                        <div class="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] border border-white/20">
                            <div class="flex justify-between items-center p-6 pb-2 border-b border-transparent">
                                <div class="flex items-center">
                                    <div class="p-2 bg-brand-100 dark:bg-brand-900/40 rounded-xl mr-3 text-brand-600"><i data-lucide="${icon}" class="h-6 w-6"></i></div>
                                    <h3 class="text-xl font-bold font-display text-slate-900 dark:text-white">${title}</h3>
                                </div>
                                <button onclick="document.getElementById('${modalId}').remove()" class="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 transition"><i data-lucide="x" class="h-5 w-5"></i></button>
                            </div>
                            
                            <div class="p-6 overflow-y-auto text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                                ${content}
                            </div>
                        </div>
                    </div>
                `;
                lucide.createIcons();
            },

            showPrivacyModal: function() {
                const t = this.t.bind(this);
                const modal = document.getElementById('modal-container');
                const modalId = 'privacy-modal';
                const icon = 'lock';
                const title = this.lang === 'en' ? "Privacy Policy" : this.lang === 'si' ? "රහස්‍යතා ප්‍රතිපත්තිය" : "தனியுரிமைக் கொள்கை";
                
                const langContent = MODAL_CONTENT[this.lang] || MODAL_CONTENT.en;
                const content = langContent.privacy;
                const btnText = langContent.buttonUnderstood;

                modal.innerHTML = `
                    <div id="${modalId}" class="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fade-in">
                        <div class="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] border border-white/20">
                            
                            <div class="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700/50">
                                <div class="flex items-center">
                                    <div class="p-2 bg-brand-100 dark:bg-brand-900/40 rounded-xl mr-3 text-brand-600"><i data-lucide="${icon}" class="h-6 w-6"></i></div>
                                    <h3 class="text-xl font-bold font-display text-slate-900 dark:text-white">${title}</h3>
                                </div>
                                <button onclick="document.getElementById('${modalId}').remove()" class="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 transition shrink-0"><i data-lucide="x" class="h-5 w-5"></i></button>
                            </div>

                            <div class="p-6 overflow-y-auto text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                                ${content}
                            </div>

                            <div class="p-4 border-t border-slate-100 dark:border-slate-700 text-center bg-slate-50/50 dark:bg-slate-800 rounded-b-[2rem]">
                                <button onclick="document.getElementById('${modalId}').remove()" class="bg-brand-600 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-brand-700 transition w-full md:w-auto">${btnText}</button>
                            </div>
                        </div>
                    </div>
                `;
                lucide.createIcons();
            },

            showRequestModal: function() {
                const t = this.t.bind(this);
                const modal = document.getElementById('modal-container');
                const modalId = 'request-modal';

                modal.innerHTML = `
                    <div id="${modalId}" class="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fade-in">
                        <div class="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] border border-white/20">
                            
                            <div class="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700/50">
                                <div class="flex items-center">
                                    <div class="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-xl mr-3 text-orange-600"><i data-lucide="message-square-plus" class="h-6 w-6"></i></div>
                                    <div>
                                        <h3 class="text-xl font-bold font-display text-slate-900 dark:text-white">${t('requestTitle')}</h3>
                                        <p class="text-xs text-slate-500 dark:text-slate-400">${t('requestSubtitle')}</p>
                                    </div>
                                </div>
                                <button onclick="document.getElementById('${modalId}').remove()" class="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 transition shrink-0"><i data-lucide="x" class="h-5 w-5"></i></button>
                            </div>

                            <div class="p-6 overflow-y-auto">
                                <form id="request-form" onsubmit="event.preventDefault(); window.app.submitRequest(event, '${modalId}')">
                                    <div class="space-y-5">
                                        <div class="space-y-1.5">
                                            <label class="form-group-label">${t('formTitle')}</label>
                                            <div class="relative group">
                                                <i data-lucide="file-question" class="h-5 w-5 group-focus-within:text-brand-500 transition-colors form-group-icon-wrapper"></i>
                                                <input required name="requestTitle" type="text" class="form-input-clean" placeholder="e.g. 2024 A/L Physics Midterm Paper">
                                            </div>
                                        </div>

                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div class="space-y-1.5 w-full">
                                                <label class="form-group-label">${t('formGrade')}</label>
                                                <div class="relative group">
                                                    <i data-lucide="graduation-cap" class="h-5 w-5 group-focus-within:text-brand-500 transition-colors form-group-icon-wrapper"></i>
                                                    <select required name="requestGrade" class="form-select-clean appearance-none">${GRADES.map(g => `<option>${g}</option>`).join('')}</select>
                                                    <i data-lucide="chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"></i>
                                                </div>
                                            </div>
                                            <div class="space-y-1.5 w-full">
                                                <label class="form-group-label">${t('formMedium')}</label>
                                                <div class="relative group">
                                                    <i data-lucide="languages" class="h-5 w-5 group-focus-within:text-brand-500 transition-colors form-group-icon-wrapper"></i>
                                                    <select required name="requestMedium" class="form-select-clean appearance-none">${MEDIUMS.map(m => `<option>${m}</option>`).join('')}</select>
                                                    <i data-lucide="chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="space-y-1.5">
                                            <label class="form-group-label">${t('formSubject')}</label>
                                            <div class="relative group">
                                                <i data-lucide="book-open-text" class="h-5 w-5 group-focus-within:text-brand-500 transition-colors form-group-icon-wrapper"></i>
                                                <select required id="request-subject-select" name="requestSubject" onchange="window.app.handleRequestSubjectChange(this.value)" class="form-select-clean appearance-none">
                                                    ${SUBJECTS.map(s => `<option value="${s}">${s}</option>`).join('')}
                                                    <option value="Other">--- Other ---</option>
                                                </select>
                                                <i data-lucide="chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"></i>
                                            </div>
                                        </div>
                                        
                                        <div class="space-y-1.5 hidden" id="request-subject-other-input">
                                            <label class="form-group-label">Other Subject Name</label>
                                            <div class="relative group">
                                                <i data-lucide="pencil" class="h-5 w-5 group-focus-within:text-brand-500 transition-colors form-group-icon-wrapper"></i>
                                                <input name="requestSubjectOther" type="text" class="form-input-clean" placeholder="Specify custom subject">
                                            </div>
                                        </div>

                                        <div class="space-y-1.5">
                                            <label class="form-group-label">${t('formDesc')} <span class="normal-case font-normal opacity-50">(Details help the community!)</span></label>
                                            <div class="relative group">
                                                <i data-lucide="message-square" class="h-5 w-5 group-focus-within:text-brand-500 transition-colors form-group-icon-wrapper"></i>
                                                <textarea name="requestDescription" rows="3" class="form-input-clean" placeholder="E.g., Looking for the 2023 Western Province paper."></textarea>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="flex justify-between gap-4 pt-6 mt-4 border-t border-slate-100 dark:border-slate-700/50">
                                        <button type="button" onclick="document.getElementById('${modalId}').remove()" class="w-1/2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-2xl transition flex justify-center items-center gap-2">
                                            Cancel
                                        </button>
                                        <button type="submit" class="w-1/2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-2xl shadow-xl hover:shadow-2xl shadow-orange-500/20 flex justify-center items-center gap-2 text-base tracking-wide">
                                            <i data-lucide="message-square-plus" class="h-5 w-5"></i> ${t('requestBtn')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                `;
                lucide.createIcons();
                document.getElementById('request-subject-select').addEventListener('change', (e) => this.handleRequestSubjectChange(e.target.value));
            },
        };

        // --- CORE INITIALIZATION ---

        document.addEventListener('DOMContentLoaded', () => {
             if (window.app) {
                window.app.init();
            }
        });
