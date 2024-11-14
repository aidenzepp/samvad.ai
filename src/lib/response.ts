import { UUID } from "crypto"

/**
 * Interface representing a standardized user response object.
 * Used for consistent user data representation across the application.
 * 
 * @interface UserResponse
 * @property {UUID} id - Unique identifier for the user, using crypto UUID
 */
export interface UserResponse {
  id: UUID
}
