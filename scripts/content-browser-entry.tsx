import {createRoot} from 'react-dom/client';
import {AuthContext,initialAuth} from '../src/auth';
import ContentEditor from '../src/content-editor';
import {PublishedPage} from '../src/content/view';
import '../src/styles.css';
createRoot(document.getElementById('root')!).render(<AuthContext.Provider value={{...initialAuth,status:'signed-in',access:'accepted',teamAccess:'allowed',teamOrganizationId:'org_fixture'}}>{location.pathname.includes('researchers')?<PublishedPage page="researchers"/>:<ContentEditor/>}</AuthContext.Provider>);
