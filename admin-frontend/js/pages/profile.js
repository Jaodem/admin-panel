import { requireAuth } from '../utils/authGuard.js';
import { renderNavbar } from '../components/navbar.js';

if (!requireAuth()) return;

renderNavbar('profile')