/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import AppSettingsModal from './AppSettingsModal';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

/**
 * Backward compatibility wrapper delegating to unified AppSettingsModal
 */
export default function ApiConfigModal({ isOpen, onClose }: ApiConfigModalProps) {
  return (
    <AppSettingsModal
      isOpen={isOpen}
      onClose={onClose}
      initialTab="server"
    />
  );
}
