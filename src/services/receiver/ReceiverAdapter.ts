import { ReceiverConfig } from '../../types/satellite';
import { AdapterType, ConnectionResult, MotorCommand, TelemetryPacket } from '../../types/telemetry';

export interface ReceiverAdapter {
  readonly type: AdapterType;
  readonly name: string;
  readonly isSimulation: boolean;

  /**
   * Validates IP address and port format strictly
   */
  validateConfig(config: ReceiverConfig): { isValid: boolean; error?: string; errorAr?: string };

  /**
   * Attempts connection to the receiver hardware/service
   */
  connect(config: ReceiverConfig): Promise<ConnectionResult>;

  /**
   * Disconnects from the receiver
   */
  disconnect(): Promise<void>;

  /**
   * Checks if currently connected
   */
  isConnected(): boolean;

  /**
   * Fetches latest telemetry packet
   */
  readTelemetry(transponderContext?: {
    frequency: number;
    symbolRate: number;
    polarity: string;
    modulation?: string;
  }): Promise<TelemetryPacket | null>;

  /**
   * Sends DiSEqC / USALS motor movement command
   */
  sendMotorCommand(cmd: MotorCommand): Promise<{ success: boolean; message: string }>;
}
