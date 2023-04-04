import { getList } from 'country-list-with-dial-code-and-flag';

export const countryCodes = getList()
  .map(({ name, dial_code, flag }) => ({ label: `${flag} ${dial_code} ${name}`, value: dial_code }))
  .filter(({ value }) => value !== '+81');
countryCodes.unshift({ label: '🇯🇵 +81 日本', value: '+81' });
