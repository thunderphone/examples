'use client';
import {createElement as h} from 'react';
import {ThunderPhoneWidget} from '@thunderphone/widget';
export default function Widget({publishableKey}) {
  return h(ThunderPhoneWidget, {publishableKey, title: 'Talk to our AI receptionist'});
}
