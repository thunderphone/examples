import {createElement as h} from 'react';
import '@thunderphone/widget/style.css';
export const metadata = {title: 'ThunderPhone widget example'};
export default function Layout({children}) {
  return h('html', {lang: 'en'}, h('body', null, children));
}
