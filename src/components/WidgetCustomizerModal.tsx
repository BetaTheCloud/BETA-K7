/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import AppSettingsModal from './AppSettingsModal';
import { WidgetConfig } from '../lib/widgetStorage';

interface WidgetCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfigs?: WidgetConfig[];
  onConfigsChange?: (configs: WidgetConfig[]) => void;
}

export default function WidgetCustomizerModal({
  isOpen,
  onClose
}: WidgetCustomizerModalProps) {
  return (
    <AppSettingsModal
      isOpen={isOpen}
      onClose={onClose}
      initialTab="widgets"
    />
  );
}
