/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const LiftLog = $root.LiftLog = (() => {

    /**
     * Namespace LiftLog.
     * @exports LiftLog
     * @namespace
     */
    const LiftLog = {};

    LiftLog.Ui = (function() {

        /**
         * Namespace Ui.
         * @memberof LiftLog
         * @namespace
         */
        const Ui = {};

        Ui.Models = (function() {

            /**
             * Namespace Models.
             * @memberof LiftLog.Ui
             * @namespace
             */
            const Models = {};

            Models.CurrentSessionStateDao = (function() {

                /**
                 * Namespace CurrentSessionStateDao.
                 * @memberof LiftLog.Ui.Models
                 * @namespace
                 */
                const CurrentSessionStateDao = {};

                CurrentSessionStateDao.CurrentSessionStateDaoV2 = (function() {

                    /**
                     * Properties of a CurrentSessionStateDaoV2.
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao
                     * @interface ICurrentSessionStateDaoV2
                     * @property {LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null} [workoutSession] CurrentSessionStateDaoV2 workoutSession
                     * @property {LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null} [historySession] CurrentSessionStateDaoV2 historySession
                     * @property {LiftLog.Ui.Models.IUuidDao|null} [latestSetTimerNotificationId] CurrentSessionStateDaoV2 latestSetTimerNotificationId
                     */

                    /**
                     * Constructs a new CurrentSessionStateDaoV2.
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao
                     * @classdesc Represents a CurrentSessionStateDaoV2.
                     * @implements ICurrentSessionStateDaoV2
                     * @constructor
                     * @param {LiftLog.Ui.Models.CurrentSessionStateDao.ICurrentSessionStateDaoV2=} [properties] Properties to set
                     */
                    function CurrentSessionStateDaoV2(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * CurrentSessionStateDaoV2 workoutSession.
                     * @member {LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null|undefined} workoutSession
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2
                     * @instance
                     */
                    CurrentSessionStateDaoV2.prototype.workoutSession = null;

                    /**
                     * CurrentSessionStateDaoV2 historySession.
                     * @member {LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null|undefined} historySession
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2
                     * @instance
                     */
                    CurrentSessionStateDaoV2.prototype.historySession = null;

                    /**
                     * CurrentSessionStateDaoV2 latestSetTimerNotificationId.
                     * @member {LiftLog.Ui.Models.IUuidDao|null|undefined} latestSetTimerNotificationId
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2
                     * @instance
                     */
                    CurrentSessionStateDaoV2.prototype.latestSetTimerNotificationId = null;

                    // OneOf field names bound to virtual getters and setters
                    let $oneOfFields;

                    /**
                     * CurrentSessionStateDaoV2 _workoutSession.
                     * @member {"workoutSession"|undefined} _workoutSession
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2
                     * @instance
                     */
                    Object.defineProperty(CurrentSessionStateDaoV2.prototype, "_workoutSession", {
                        get: $util.oneOfGetter($oneOfFields = ["workoutSession"]),
                        set: $util.oneOfSetter($oneOfFields)
                    });

                    /**
                     * CurrentSessionStateDaoV2 _historySession.
                     * @member {"historySession"|undefined} _historySession
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2
                     * @instance
                     */
                    Object.defineProperty(CurrentSessionStateDaoV2.prototype, "_historySession", {
                        get: $util.oneOfGetter($oneOfFields = ["historySession"]),
                        set: $util.oneOfSetter($oneOfFields)
                    });

                    /**
                     * CurrentSessionStateDaoV2 _latestSetTimerNotificationId.
                     * @member {"latestSetTimerNotificationId"|undefined} _latestSetTimerNotificationId
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2
                     * @instance
                     */
                    Object.defineProperty(CurrentSessionStateDaoV2.prototype, "_latestSetTimerNotificationId", {
                        get: $util.oneOfGetter($oneOfFields = ["latestSetTimerNotificationId"]),
                        set: $util.oneOfSetter($oneOfFields)
                    });

                    /**
                     * Creates a new CurrentSessionStateDaoV2 instance using the specified properties.
                     * @function create
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.CurrentSessionStateDao.ICurrentSessionStateDaoV2=} [properties] Properties to set
                     * @returns {LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2} CurrentSessionStateDaoV2 instance
                     */
                    CurrentSessionStateDaoV2.create = function create(properties) {
                        return new CurrentSessionStateDaoV2(properties);
                    };

                    /**
                     * Encodes the specified CurrentSessionStateDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2.verify|verify} messages.
                     * @function encode
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.CurrentSessionStateDao.ICurrentSessionStateDaoV2} message CurrentSessionStateDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    CurrentSessionStateDaoV2.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.workoutSession != null && Object.hasOwnProperty.call(message, "workoutSession"))
                            $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.encode(message.workoutSession, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        if (message.historySession != null && Object.hasOwnProperty.call(message, "historySession"))
                            $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.encode(message.historySession, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                        if (message.latestSetTimerNotificationId != null && Object.hasOwnProperty.call(message, "latestSetTimerNotificationId"))
                            $root.LiftLog.Ui.Models.UuidDao.encode(message.latestSetTimerNotificationId, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified CurrentSessionStateDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.CurrentSessionStateDao.ICurrentSessionStateDaoV2} message CurrentSessionStateDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    CurrentSessionStateDaoV2.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a CurrentSessionStateDaoV2 message from the specified reader or buffer.
                     * @function decode
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2} CurrentSessionStateDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    CurrentSessionStateDaoV2.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    message.workoutSession = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.decode(reader, reader.uint32());
                                    break;
                                }
                            case 2: {
                                    message.historySession = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.decode(reader, reader.uint32());
                                    break;
                                }
                            case 3: {
                                    message.latestSetTimerNotificationId = $root.LiftLog.Ui.Models.UuidDao.decode(reader, reader.uint32());
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a CurrentSessionStateDaoV2 message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2} CurrentSessionStateDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    CurrentSessionStateDaoV2.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a CurrentSessionStateDaoV2 message.
                     * @function verify
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    CurrentSessionStateDaoV2.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        let properties = {};
                        if (message.workoutSession != null && message.hasOwnProperty("workoutSession")) {
                            properties._workoutSession = 1;
                            {
                                let error = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.verify(message.workoutSession);
                                if (error)
                                    return "workoutSession." + error;
                            }
                        }
                        if (message.historySession != null && message.hasOwnProperty("historySession")) {
                            properties._historySession = 1;
                            {
                                let error = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.verify(message.historySession);
                                if (error)
                                    return "historySession." + error;
                            }
                        }
                        if (message.latestSetTimerNotificationId != null && message.hasOwnProperty("latestSetTimerNotificationId")) {
                            properties._latestSetTimerNotificationId = 1;
                            {
                                let error = $root.LiftLog.Ui.Models.UuidDao.verify(message.latestSetTimerNotificationId);
                                if (error)
                                    return "latestSetTimerNotificationId." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a CurrentSessionStateDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2} CurrentSessionStateDaoV2
                     */
                    CurrentSessionStateDaoV2.fromObject = function fromObject(object) {
                        if (object instanceof $root.LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2)
                            return object;
                        let message = new $root.LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2();
                        if (object.workoutSession != null) {
                            if (typeof object.workoutSession !== "object")
                                throw TypeError(".LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2.workoutSession: object expected");
                            message.workoutSession = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.fromObject(object.workoutSession);
                        }
                        if (object.historySession != null) {
                            if (typeof object.historySession !== "object")
                                throw TypeError(".LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2.historySession: object expected");
                            message.historySession = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.fromObject(object.historySession);
                        }
                        if (object.latestSetTimerNotificationId != null) {
                            if (typeof object.latestSetTimerNotificationId !== "object")
                                throw TypeError(".LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2.latestSetTimerNotificationId: object expected");
                            message.latestSetTimerNotificationId = $root.LiftLog.Ui.Models.UuidDao.fromObject(object.latestSetTimerNotificationId);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a CurrentSessionStateDaoV2 message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2} message CurrentSessionStateDaoV2
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    CurrentSessionStateDaoV2.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (message.workoutSession != null && message.hasOwnProperty("workoutSession")) {
                            object.workoutSession = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.toObject(message.workoutSession, options);
                            if (options.oneofs)
                                object._workoutSession = "workoutSession";
                        }
                        if (message.historySession != null && message.hasOwnProperty("historySession")) {
                            object.historySession = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.toObject(message.historySession, options);
                            if (options.oneofs)
                                object._historySession = "historySession";
                        }
                        if (message.latestSetTimerNotificationId != null && message.hasOwnProperty("latestSetTimerNotificationId")) {
                            object.latestSetTimerNotificationId = $root.LiftLog.Ui.Models.UuidDao.toObject(message.latestSetTimerNotificationId, options);
                            if (options.oneofs)
                                object._latestSetTimerNotificationId = "latestSetTimerNotificationId";
                        }
                        return object;
                    };

                    /**
                     * Converts this CurrentSessionStateDaoV2 to JSON.
                     * @function toJSON
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    CurrentSessionStateDaoV2.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for CurrentSessionStateDaoV2
                     * @function getTypeUrl
                     * @memberof LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    CurrentSessionStateDaoV2.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2";
                    };

                    return CurrentSessionStateDaoV2;
                })();

                return CurrentSessionStateDao;
            })();

            Models.UuidDao = (function() {

                /**
                 * Properties of an UuidDao.
                 * @memberof LiftLog.Ui.Models
                 * @interface IUuidDao
                 * @property {Uint8Array|null} [value] UuidDao value
                 */

                /**
                 * Constructs a new UuidDao.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents an UuidDao.
                 * @implements IUuidDao
                 * @constructor
                 * @param {LiftLog.Ui.Models.IUuidDao=} [properties] Properties to set
                 */
                function UuidDao(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * UuidDao value.
                 * @member {Uint8Array} value
                 * @memberof LiftLog.Ui.Models.UuidDao
                 * @instance
                 */
                UuidDao.prototype.value = $util.newBuffer([]);

                /**
                 * Creates a new UuidDao instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.UuidDao
                 * @static
                 * @param {LiftLog.Ui.Models.IUuidDao=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.UuidDao} UuidDao instance
                 */
                UuidDao.create = function create(properties) {
                    return new UuidDao(properties);
                };

                /**
                 * Encodes the specified UuidDao message. Does not implicitly {@link LiftLog.Ui.Models.UuidDao.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.UuidDao
                 * @static
                 * @param {LiftLog.Ui.Models.IUuidDao} message UuidDao message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                UuidDao.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                        writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.value);
                    return writer;
                };

                /**
                 * Encodes the specified UuidDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.UuidDao.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.UuidDao
                 * @static
                 * @param {LiftLog.Ui.Models.IUuidDao} message UuidDao message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                UuidDao.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an UuidDao message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.UuidDao
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.UuidDao} UuidDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                UuidDao.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.UuidDao();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.value = reader.bytes();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an UuidDao message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.UuidDao
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.UuidDao} UuidDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                UuidDao.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an UuidDao message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.UuidDao
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                UuidDao.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.value != null && message.hasOwnProperty("value"))
                        if (!(message.value && typeof message.value.length === "number" || $util.isString(message.value)))
                            return "value: buffer expected";
                    return null;
                };

                /**
                 * Creates an UuidDao message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.UuidDao
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.UuidDao} UuidDao
                 */
                UuidDao.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.UuidDao)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.UuidDao();
                    if (object.value != null)
                        if (typeof object.value === "string")
                            $util.base64.decode(object.value, message.value = $util.newBuffer($util.base64.length(object.value)), 0);
                        else if (object.value.length >= 0)
                            message.value = object.value;
                    return message;
                };

                /**
                 * Creates a plain object from an UuidDao message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.UuidDao
                 * @static
                 * @param {LiftLog.Ui.Models.UuidDao} message UuidDao
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                UuidDao.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults)
                        if (options.bytes === String)
                            object.value = "";
                        else {
                            object.value = [];
                            if (options.bytes !== Array)
                                object.value = $util.newBuffer(object.value);
                        }
                    if (message.value != null && message.hasOwnProperty("value"))
                        object.value = options.bytes === String ? $util.base64.encode(message.value, 0, message.value.length) : options.bytes === Array ? Array.prototype.slice.call(message.value) : message.value;
                    return object;
                };

                /**
                 * Converts this UuidDao to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.UuidDao
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                UuidDao.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for UuidDao
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.UuidDao
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                UuidDao.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.UuidDao";
                };

                return UuidDao;
            })();

            Models.DateOnlyDao = (function() {

                /**
                 * Properties of a DateOnlyDao.
                 * @memberof LiftLog.Ui.Models
                 * @interface IDateOnlyDao
                 * @property {number|null} [year] DateOnlyDao year
                 * @property {number|null} [month] DateOnlyDao month
                 * @property {number|null} [day] DateOnlyDao day
                 */

                /**
                 * Constructs a new DateOnlyDao.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents a DateOnlyDao.
                 * @implements IDateOnlyDao
                 * @constructor
                 * @param {LiftLog.Ui.Models.IDateOnlyDao=} [properties] Properties to set
                 */
                function DateOnlyDao(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * DateOnlyDao year.
                 * @member {number} year
                 * @memberof LiftLog.Ui.Models.DateOnlyDao
                 * @instance
                 */
                DateOnlyDao.prototype.year = 0;

                /**
                 * DateOnlyDao month.
                 * @member {number} month
                 * @memberof LiftLog.Ui.Models.DateOnlyDao
                 * @instance
                 */
                DateOnlyDao.prototype.month = 0;

                /**
                 * DateOnlyDao day.
                 * @member {number} day
                 * @memberof LiftLog.Ui.Models.DateOnlyDao
                 * @instance
                 */
                DateOnlyDao.prototype.day = 0;

                /**
                 * Creates a new DateOnlyDao instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.DateOnlyDao
                 * @static
                 * @param {LiftLog.Ui.Models.IDateOnlyDao=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.DateOnlyDao} DateOnlyDao instance
                 */
                DateOnlyDao.create = function create(properties) {
                    return new DateOnlyDao(properties);
                };

                /**
                 * Encodes the specified DateOnlyDao message. Does not implicitly {@link LiftLog.Ui.Models.DateOnlyDao.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.DateOnlyDao
                 * @static
                 * @param {LiftLog.Ui.Models.IDateOnlyDao} message DateOnlyDao message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DateOnlyDao.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.year != null && Object.hasOwnProperty.call(message, "year"))
                        writer.uint32(/* id 1, wireType 0 =*/8).int32(message.year);
                    if (message.month != null && Object.hasOwnProperty.call(message, "month"))
                        writer.uint32(/* id 2, wireType 0 =*/16).int32(message.month);
                    if (message.day != null && Object.hasOwnProperty.call(message, "day"))
                        writer.uint32(/* id 3, wireType 0 =*/24).int32(message.day);
                    return writer;
                };

                /**
                 * Encodes the specified DateOnlyDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.DateOnlyDao.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.DateOnlyDao
                 * @static
                 * @param {LiftLog.Ui.Models.IDateOnlyDao} message DateOnlyDao message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DateOnlyDao.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a DateOnlyDao message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.DateOnlyDao
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.DateOnlyDao} DateOnlyDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DateOnlyDao.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.DateOnlyDao();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.year = reader.int32();
                                break;
                            }
                        case 2: {
                                message.month = reader.int32();
                                break;
                            }
                        case 3: {
                                message.day = reader.int32();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a DateOnlyDao message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.DateOnlyDao
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.DateOnlyDao} DateOnlyDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DateOnlyDao.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a DateOnlyDao message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.DateOnlyDao
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                DateOnlyDao.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.year != null && message.hasOwnProperty("year"))
                        if (!$util.isInteger(message.year))
                            return "year: integer expected";
                    if (message.month != null && message.hasOwnProperty("month"))
                        if (!$util.isInteger(message.month))
                            return "month: integer expected";
                    if (message.day != null && message.hasOwnProperty("day"))
                        if (!$util.isInteger(message.day))
                            return "day: integer expected";
                    return null;
                };

                /**
                 * Creates a DateOnlyDao message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.DateOnlyDao
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.DateOnlyDao} DateOnlyDao
                 */
                DateOnlyDao.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.DateOnlyDao)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.DateOnlyDao();
                    if (object.year != null)
                        message.year = object.year | 0;
                    if (object.month != null)
                        message.month = object.month | 0;
                    if (object.day != null)
                        message.day = object.day | 0;
                    return message;
                };

                /**
                 * Creates a plain object from a DateOnlyDao message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.DateOnlyDao
                 * @static
                 * @param {LiftLog.Ui.Models.DateOnlyDao} message DateOnlyDao
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                DateOnlyDao.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.year = 0;
                        object.month = 0;
                        object.day = 0;
                    }
                    if (message.year != null && message.hasOwnProperty("year"))
                        object.year = message.year;
                    if (message.month != null && message.hasOwnProperty("month"))
                        object.month = message.month;
                    if (message.day != null && message.hasOwnProperty("day"))
                        object.day = message.day;
                    return object;
                };

                /**
                 * Converts this DateOnlyDao to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.DateOnlyDao
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                DateOnlyDao.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for DateOnlyDao
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.DateOnlyDao
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                DateOnlyDao.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.DateOnlyDao";
                };

                return DateOnlyDao;
            })();

            Models.DecimalValue = (function() {

                /**
                 * Properties of a DecimalValue.
                 * @memberof LiftLog.Ui.Models
                 * @interface IDecimalValue
                 * @property {Long|null} [units] DecimalValue units
                 * @property {number|null} [nanos] DecimalValue nanos
                 */

                /**
                 * Constructs a new DecimalValue.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents a DecimalValue.
                 * @implements IDecimalValue
                 * @constructor
                 * @param {LiftLog.Ui.Models.IDecimalValue=} [properties] Properties to set
                 */
                function DecimalValue(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * DecimalValue units.
                 * @member {Long} units
                 * @memberof LiftLog.Ui.Models.DecimalValue
                 * @instance
                 */
                DecimalValue.prototype.units = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * DecimalValue nanos.
                 * @member {number} nanos
                 * @memberof LiftLog.Ui.Models.DecimalValue
                 * @instance
                 */
                DecimalValue.prototype.nanos = 0;

                /**
                 * Creates a new DecimalValue instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.DecimalValue
                 * @static
                 * @param {LiftLog.Ui.Models.IDecimalValue=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.DecimalValue} DecimalValue instance
                 */
                DecimalValue.create = function create(properties) {
                    return new DecimalValue(properties);
                };

                /**
                 * Encodes the specified DecimalValue message. Does not implicitly {@link LiftLog.Ui.Models.DecimalValue.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.DecimalValue
                 * @static
                 * @param {LiftLog.Ui.Models.IDecimalValue} message DecimalValue message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DecimalValue.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.units != null && Object.hasOwnProperty.call(message, "units"))
                        writer.uint32(/* id 1, wireType 0 =*/8).int64(message.units);
                    if (message.nanos != null && Object.hasOwnProperty.call(message, "nanos"))
                        writer.uint32(/* id 2, wireType 5 =*/21).sfixed32(message.nanos);
                    return writer;
                };

                /**
                 * Encodes the specified DecimalValue message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.DecimalValue.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.DecimalValue
                 * @static
                 * @param {LiftLog.Ui.Models.IDecimalValue} message DecimalValue message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DecimalValue.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a DecimalValue message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.DecimalValue
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.DecimalValue} DecimalValue
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DecimalValue.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.DecimalValue();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.units = reader.int64();
                                break;
                            }
                        case 2: {
                                message.nanos = reader.sfixed32();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a DecimalValue message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.DecimalValue
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.DecimalValue} DecimalValue
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DecimalValue.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a DecimalValue message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.DecimalValue
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                DecimalValue.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.units != null && message.hasOwnProperty("units"))
                        if (!$util.isInteger(message.units) && !(message.units && $util.isInteger(message.units.low) && $util.isInteger(message.units.high)))
                            return "units: integer|Long expected";
                    if (message.nanos != null && message.hasOwnProperty("nanos"))
                        if (!$util.isInteger(message.nanos))
                            return "nanos: integer expected";
                    return null;
                };

                /**
                 * Creates a DecimalValue message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.DecimalValue
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.DecimalValue} DecimalValue
                 */
                DecimalValue.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.DecimalValue)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.DecimalValue();
                    if (object.units != null)
                        if ($util.Long)
                            (message.units = $util.Long.fromValue(object.units)).unsigned = false;
                        else if (typeof object.units === "string")
                            message.units = parseInt(object.units, 10);
                        else if (typeof object.units === "number")
                            message.units = object.units;
                        else if (typeof object.units === "object")
                            message.units = new $util.LongBits(object.units.low >>> 0, object.units.high >>> 0).toNumber();
                    if (object.nanos != null)
                        message.nanos = object.nanos | 0;
                    return message;
                };

                /**
                 * Creates a plain object from a DecimalValue message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.DecimalValue
                 * @static
                 * @param {LiftLog.Ui.Models.DecimalValue} message DecimalValue
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                DecimalValue.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.units = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.units = options.longs === String ? "0" : 0;
                        object.nanos = 0;
                    }
                    if (message.units != null && message.hasOwnProperty("units"))
                        if (typeof message.units === "number")
                            object.units = options.longs === String ? String(message.units) : message.units;
                        else
                            object.units = options.longs === String ? $util.Long.prototype.toString.call(message.units) : options.longs === Number ? new $util.LongBits(message.units.low >>> 0, message.units.high >>> 0).toNumber() : message.units;
                    if (message.nanos != null && message.hasOwnProperty("nanos"))
                        object.nanos = message.nanos;
                    return object;
                };

                /**
                 * Converts this DecimalValue to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.DecimalValue
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                DecimalValue.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for DecimalValue
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.DecimalValue
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                DecimalValue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.DecimalValue";
                };

                return DecimalValue;
            })();

            Models.TimeOnlyDao = (function() {

                /**
                 * Properties of a TimeOnlyDao.
                 * @memberof LiftLog.Ui.Models
                 * @interface ITimeOnlyDao
                 * @property {number|null} [hour] TimeOnlyDao hour
                 * @property {number|null} [minute] TimeOnlyDao minute
                 * @property {number|null} [second] TimeOnlyDao second
                 * @property {number|null} [millisecond] TimeOnlyDao millisecond
                 * @property {number|null} [microsecond] TimeOnlyDao microsecond
                 */

                /**
                 * Constructs a new TimeOnlyDao.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents a TimeOnlyDao.
                 * @implements ITimeOnlyDao
                 * @constructor
                 * @param {LiftLog.Ui.Models.ITimeOnlyDao=} [properties] Properties to set
                 */
                function TimeOnlyDao(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * TimeOnlyDao hour.
                 * @member {number} hour
                 * @memberof LiftLog.Ui.Models.TimeOnlyDao
                 * @instance
                 */
                TimeOnlyDao.prototype.hour = 0;

                /**
                 * TimeOnlyDao minute.
                 * @member {number} minute
                 * @memberof LiftLog.Ui.Models.TimeOnlyDao
                 * @instance
                 */
                TimeOnlyDao.prototype.minute = 0;

                /**
                 * TimeOnlyDao second.
                 * @member {number} second
                 * @memberof LiftLog.Ui.Models.TimeOnlyDao
                 * @instance
                 */
                TimeOnlyDao.prototype.second = 0;

                /**
                 * TimeOnlyDao millisecond.
                 * @member {number} millisecond
                 * @memberof LiftLog.Ui.Models.TimeOnlyDao
                 * @instance
                 */
                TimeOnlyDao.prototype.millisecond = 0;

                /**
                 * TimeOnlyDao microsecond.
                 * @member {number} microsecond
                 * @memberof LiftLog.Ui.Models.TimeOnlyDao
                 * @instance
                 */
                TimeOnlyDao.prototype.microsecond = 0;

                /**
                 * Creates a new TimeOnlyDao instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.TimeOnlyDao
                 * @static
                 * @param {LiftLog.Ui.Models.ITimeOnlyDao=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.TimeOnlyDao} TimeOnlyDao instance
                 */
                TimeOnlyDao.create = function create(properties) {
                    return new TimeOnlyDao(properties);
                };

                /**
                 * Encodes the specified TimeOnlyDao message. Does not implicitly {@link LiftLog.Ui.Models.TimeOnlyDao.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.TimeOnlyDao
                 * @static
                 * @param {LiftLog.Ui.Models.ITimeOnlyDao} message TimeOnlyDao message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                TimeOnlyDao.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.hour != null && Object.hasOwnProperty.call(message, "hour"))
                        writer.uint32(/* id 1, wireType 0 =*/8).int32(message.hour);
                    if (message.minute != null && Object.hasOwnProperty.call(message, "minute"))
                        writer.uint32(/* id 2, wireType 0 =*/16).int32(message.minute);
                    if (message.second != null && Object.hasOwnProperty.call(message, "second"))
                        writer.uint32(/* id 3, wireType 0 =*/24).int32(message.second);
                    if (message.millisecond != null && Object.hasOwnProperty.call(message, "millisecond"))
                        writer.uint32(/* id 4, wireType 0 =*/32).int32(message.millisecond);
                    if (message.microsecond != null && Object.hasOwnProperty.call(message, "microsecond"))
                        writer.uint32(/* id 5, wireType 0 =*/40).int32(message.microsecond);
                    return writer;
                };

                /**
                 * Encodes the specified TimeOnlyDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.TimeOnlyDao.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.TimeOnlyDao
                 * @static
                 * @param {LiftLog.Ui.Models.ITimeOnlyDao} message TimeOnlyDao message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                TimeOnlyDao.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a TimeOnlyDao message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.TimeOnlyDao
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.TimeOnlyDao} TimeOnlyDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                TimeOnlyDao.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.TimeOnlyDao();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.hour = reader.int32();
                                break;
                            }
                        case 2: {
                                message.minute = reader.int32();
                                break;
                            }
                        case 3: {
                                message.second = reader.int32();
                                break;
                            }
                        case 4: {
                                message.millisecond = reader.int32();
                                break;
                            }
                        case 5: {
                                message.microsecond = reader.int32();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a TimeOnlyDao message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.TimeOnlyDao
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.TimeOnlyDao} TimeOnlyDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                TimeOnlyDao.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a TimeOnlyDao message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.TimeOnlyDao
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                TimeOnlyDao.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.hour != null && message.hasOwnProperty("hour"))
                        if (!$util.isInteger(message.hour))
                            return "hour: integer expected";
                    if (message.minute != null && message.hasOwnProperty("minute"))
                        if (!$util.isInteger(message.minute))
                            return "minute: integer expected";
                    if (message.second != null && message.hasOwnProperty("second"))
                        if (!$util.isInteger(message.second))
                            return "second: integer expected";
                    if (message.millisecond != null && message.hasOwnProperty("millisecond"))
                        if (!$util.isInteger(message.millisecond))
                            return "millisecond: integer expected";
                    if (message.microsecond != null && message.hasOwnProperty("microsecond"))
                        if (!$util.isInteger(message.microsecond))
                            return "microsecond: integer expected";
                    return null;
                };

                /**
                 * Creates a TimeOnlyDao message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.TimeOnlyDao
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.TimeOnlyDao} TimeOnlyDao
                 */
                TimeOnlyDao.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.TimeOnlyDao)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.TimeOnlyDao();
                    if (object.hour != null)
                        message.hour = object.hour | 0;
                    if (object.minute != null)
                        message.minute = object.minute | 0;
                    if (object.second != null)
                        message.second = object.second | 0;
                    if (object.millisecond != null)
                        message.millisecond = object.millisecond | 0;
                    if (object.microsecond != null)
                        message.microsecond = object.microsecond | 0;
                    return message;
                };

                /**
                 * Creates a plain object from a TimeOnlyDao message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.TimeOnlyDao
                 * @static
                 * @param {LiftLog.Ui.Models.TimeOnlyDao} message TimeOnlyDao
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                TimeOnlyDao.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.hour = 0;
                        object.minute = 0;
                        object.second = 0;
                        object.millisecond = 0;
                        object.microsecond = 0;
                    }
                    if (message.hour != null && message.hasOwnProperty("hour"))
                        object.hour = message.hour;
                    if (message.minute != null && message.hasOwnProperty("minute"))
                        object.minute = message.minute;
                    if (message.second != null && message.hasOwnProperty("second"))
                        object.second = message.second;
                    if (message.millisecond != null && message.hasOwnProperty("millisecond"))
                        object.millisecond = message.millisecond;
                    if (message.microsecond != null && message.hasOwnProperty("microsecond"))
                        object.microsecond = message.microsecond;
                    return object;
                };

                /**
                 * Converts this TimeOnlyDao to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.TimeOnlyDao
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                TimeOnlyDao.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for TimeOnlyDao
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.TimeOnlyDao
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                TimeOnlyDao.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.TimeOnlyDao";
                };

                return TimeOnlyDao;
            })();

            Models.SessionHistoryDao = (function() {

                /**
                 * Namespace SessionHistoryDao.
                 * @memberof LiftLog.Ui.Models
                 * @namespace
                 */
                const SessionHistoryDao = {};

                SessionHistoryDao.SessionHistoryDaoV2 = (function() {

                    /**
                     * Properties of a SessionHistoryDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao
                     * @interface ISessionHistoryDaoV2
                     * @property {Array.<LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2>|null} [completedSessions] SessionHistoryDaoV2 completedSessions
                     */

                    /**
                     * Constructs a new SessionHistoryDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao
                     * @classdesc Represents a SessionHistoryDaoV2.
                     * @implements ISessionHistoryDaoV2
                     * @constructor
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.ISessionHistoryDaoV2=} [properties] Properties to set
                     */
                    function SessionHistoryDaoV2(properties) {
                        this.completedSessions = [];
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * SessionHistoryDaoV2 completedSessions.
                     * @member {Array.<LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2>} completedSessions
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2
                     * @instance
                     */
                    SessionHistoryDaoV2.prototype.completedSessions = $util.emptyArray;

                    /**
                     * Creates a new SessionHistoryDaoV2 instance using the specified properties.
                     * @function create
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.ISessionHistoryDaoV2=} [properties] Properties to set
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2} SessionHistoryDaoV2 instance
                     */
                    SessionHistoryDaoV2.create = function create(properties) {
                        return new SessionHistoryDaoV2(properties);
                    };

                    /**
                     * Encodes the specified SessionHistoryDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2.verify|verify} messages.
                     * @function encode
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.ISessionHistoryDaoV2} message SessionHistoryDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    SessionHistoryDaoV2.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.completedSessions != null && message.completedSessions.length)
                            for (let i = 0; i < message.completedSessions.length; ++i)
                                $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.encode(message.completedSessions[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified SessionHistoryDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.ISessionHistoryDaoV2} message SessionHistoryDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    SessionHistoryDaoV2.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a SessionHistoryDaoV2 message from the specified reader or buffer.
                     * @function decode
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2} SessionHistoryDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    SessionHistoryDaoV2.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    if (!(message.completedSessions && message.completedSessions.length))
                                        message.completedSessions = [];
                                    message.completedSessions.push($root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.decode(reader, reader.uint32()));
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a SessionHistoryDaoV2 message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2} SessionHistoryDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    SessionHistoryDaoV2.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a SessionHistoryDaoV2 message.
                     * @function verify
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    SessionHistoryDaoV2.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.completedSessions != null && message.hasOwnProperty("completedSessions")) {
                            if (!Array.isArray(message.completedSessions))
                                return "completedSessions: array expected";
                            for (let i = 0; i < message.completedSessions.length; ++i) {
                                let error = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.verify(message.completedSessions[i]);
                                if (error)
                                    return "completedSessions." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a SessionHistoryDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2} SessionHistoryDaoV2
                     */
                    SessionHistoryDaoV2.fromObject = function fromObject(object) {
                        if (object instanceof $root.LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2)
                            return object;
                        let message = new $root.LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2();
                        if (object.completedSessions) {
                            if (!Array.isArray(object.completedSessions))
                                throw TypeError(".LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2.completedSessions: array expected");
                            message.completedSessions = [];
                            for (let i = 0; i < object.completedSessions.length; ++i) {
                                if (typeof object.completedSessions[i] !== "object")
                                    throw TypeError(".LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2.completedSessions: object expected");
                                message.completedSessions[i] = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.fromObject(object.completedSessions[i]);
                            }
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a SessionHistoryDaoV2 message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2} message SessionHistoryDaoV2
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    SessionHistoryDaoV2.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.completedSessions = [];
                        if (message.completedSessions && message.completedSessions.length) {
                            object.completedSessions = [];
                            for (let j = 0; j < message.completedSessions.length; ++j)
                                object.completedSessions[j] = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.toObject(message.completedSessions[j], options);
                        }
                        return object;
                    };

                    /**
                     * Converts this SessionHistoryDaoV2 to JSON.
                     * @function toJSON
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    SessionHistoryDaoV2.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for SessionHistoryDaoV2
                     * @function getTypeUrl
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    SessionHistoryDaoV2.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2";
                    };

                    return SessionHistoryDaoV2;
                })();

                SessionHistoryDao.SessionDaoV2 = (function() {

                    /**
                     * Properties of a SessionDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao
                     * @interface ISessionDaoV2
                     * @property {LiftLog.Ui.Models.IUuidDao|null} [id] SessionDaoV2 id
                     * @property {string|null} [sessionName] SessionDaoV2 sessionName
                     * @property {Array.<LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2>|null} [recordedExercises] SessionDaoV2 recordedExercises
                     * @property {LiftLog.Ui.Models.IDateOnlyDao|null} [date] SessionDaoV2 date
                     * @property {LiftLog.Ui.Models.IDecimalValue|null} [bodyweight] SessionDaoV2 bodyweight
                     * @property {string|null} [blueprintNotes] SessionDaoV2 blueprintNotes
                     */

                    /**
                     * Constructs a new SessionDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao
                     * @classdesc Represents a SessionDaoV2.
                     * @implements ISessionDaoV2
                     * @constructor
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2=} [properties] Properties to set
                     */
                    function SessionDaoV2(properties) {
                        this.recordedExercises = [];
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * SessionDaoV2 id.
                     * @member {LiftLog.Ui.Models.IUuidDao|null|undefined} id
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2
                     * @instance
                     */
                    SessionDaoV2.prototype.id = null;

                    /**
                     * SessionDaoV2 sessionName.
                     * @member {string} sessionName
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2
                     * @instance
                     */
                    SessionDaoV2.prototype.sessionName = "";

                    /**
                     * SessionDaoV2 recordedExercises.
                     * @member {Array.<LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2>} recordedExercises
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2
                     * @instance
                     */
                    SessionDaoV2.prototype.recordedExercises = $util.emptyArray;

                    /**
                     * SessionDaoV2 date.
                     * @member {LiftLog.Ui.Models.IDateOnlyDao|null|undefined} date
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2
                     * @instance
                     */
                    SessionDaoV2.prototype.date = null;

                    /**
                     * SessionDaoV2 bodyweight.
                     * @member {LiftLog.Ui.Models.IDecimalValue|null|undefined} bodyweight
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2
                     * @instance
                     */
                    SessionDaoV2.prototype.bodyweight = null;

                    /**
                     * SessionDaoV2 blueprintNotes.
                     * @member {string} blueprintNotes
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2
                     * @instance
                     */
                    SessionDaoV2.prototype.blueprintNotes = "";

                    // OneOf field names bound to virtual getters and setters
                    let $oneOfFields;

                    /**
                     * SessionDaoV2 _bodyweight.
                     * @member {"bodyweight"|undefined} _bodyweight
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2
                     * @instance
                     */
                    Object.defineProperty(SessionDaoV2.prototype, "_bodyweight", {
                        get: $util.oneOfGetter($oneOfFields = ["bodyweight"]),
                        set: $util.oneOfSetter($oneOfFields)
                    });

                    /**
                     * Creates a new SessionDaoV2 instance using the specified properties.
                     * @function create
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2=} [properties] Properties to set
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2} SessionDaoV2 instance
                     */
                    SessionDaoV2.create = function create(properties) {
                        return new SessionDaoV2(properties);
                    };

                    /**
                     * Encodes the specified SessionDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.verify|verify} messages.
                     * @function encode
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2} message SessionDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    SessionDaoV2.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                            $root.LiftLog.Ui.Models.UuidDao.encode(message.id, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        if (message.sessionName != null && Object.hasOwnProperty.call(message, "sessionName"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.sessionName);
                        if (message.recordedExercises != null && message.recordedExercises.length)
                            for (let i = 0; i < message.recordedExercises.length; ++i)
                                $root.LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2.encode(message.recordedExercises[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                        if (message.date != null && Object.hasOwnProperty.call(message, "date"))
                            $root.LiftLog.Ui.Models.DateOnlyDao.encode(message.date, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                        if (message.bodyweight != null && Object.hasOwnProperty.call(message, "bodyweight"))
                            $root.LiftLog.Ui.Models.DecimalValue.encode(message.bodyweight, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                        if (message.blueprintNotes != null && Object.hasOwnProperty.call(message, "blueprintNotes"))
                            writer.uint32(/* id 6, wireType 2 =*/50).string(message.blueprintNotes);
                        return writer;
                    };

                    /**
                     * Encodes the specified SessionDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2} message SessionDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    SessionDaoV2.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a SessionDaoV2 message from the specified reader or buffer.
                     * @function decode
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2} SessionDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    SessionDaoV2.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    message.id = $root.LiftLog.Ui.Models.UuidDao.decode(reader, reader.uint32());
                                    break;
                                }
                            case 2: {
                                    message.sessionName = reader.string();
                                    break;
                                }
                            case 3: {
                                    if (!(message.recordedExercises && message.recordedExercises.length))
                                        message.recordedExercises = [];
                                    message.recordedExercises.push($root.LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 4: {
                                    message.date = $root.LiftLog.Ui.Models.DateOnlyDao.decode(reader, reader.uint32());
                                    break;
                                }
                            case 5: {
                                    message.bodyweight = $root.LiftLog.Ui.Models.DecimalValue.decode(reader, reader.uint32());
                                    break;
                                }
                            case 6: {
                                    message.blueprintNotes = reader.string();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a SessionDaoV2 message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2} SessionDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    SessionDaoV2.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a SessionDaoV2 message.
                     * @function verify
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    SessionDaoV2.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        let properties = {};
                        if (message.id != null && message.hasOwnProperty("id")) {
                            let error = $root.LiftLog.Ui.Models.UuidDao.verify(message.id);
                            if (error)
                                return "id." + error;
                        }
                        if (message.sessionName != null && message.hasOwnProperty("sessionName"))
                            if (!$util.isString(message.sessionName))
                                return "sessionName: string expected";
                        if (message.recordedExercises != null && message.hasOwnProperty("recordedExercises")) {
                            if (!Array.isArray(message.recordedExercises))
                                return "recordedExercises: array expected";
                            for (let i = 0; i < message.recordedExercises.length; ++i) {
                                let error = $root.LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2.verify(message.recordedExercises[i]);
                                if (error)
                                    return "recordedExercises." + error;
                            }
                        }
                        if (message.date != null && message.hasOwnProperty("date")) {
                            let error = $root.LiftLog.Ui.Models.DateOnlyDao.verify(message.date);
                            if (error)
                                return "date." + error;
                        }
                        if (message.bodyweight != null && message.hasOwnProperty("bodyweight")) {
                            properties._bodyweight = 1;
                            {
                                let error = $root.LiftLog.Ui.Models.DecimalValue.verify(message.bodyweight);
                                if (error)
                                    return "bodyweight." + error;
                            }
                        }
                        if (message.blueprintNotes != null && message.hasOwnProperty("blueprintNotes"))
                            if (!$util.isString(message.blueprintNotes))
                                return "blueprintNotes: string expected";
                        return null;
                    };

                    /**
                     * Creates a SessionDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2} SessionDaoV2
                     */
                    SessionDaoV2.fromObject = function fromObject(object) {
                        if (object instanceof $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2)
                            return object;
                        let message = new $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2();
                        if (object.id != null) {
                            if (typeof object.id !== "object")
                                throw TypeError(".LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.id: object expected");
                            message.id = $root.LiftLog.Ui.Models.UuidDao.fromObject(object.id);
                        }
                        if (object.sessionName != null)
                            message.sessionName = String(object.sessionName);
                        if (object.recordedExercises) {
                            if (!Array.isArray(object.recordedExercises))
                                throw TypeError(".LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.recordedExercises: array expected");
                            message.recordedExercises = [];
                            for (let i = 0; i < object.recordedExercises.length; ++i) {
                                if (typeof object.recordedExercises[i] !== "object")
                                    throw TypeError(".LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.recordedExercises: object expected");
                                message.recordedExercises[i] = $root.LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2.fromObject(object.recordedExercises[i]);
                            }
                        }
                        if (object.date != null) {
                            if (typeof object.date !== "object")
                                throw TypeError(".LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.date: object expected");
                            message.date = $root.LiftLog.Ui.Models.DateOnlyDao.fromObject(object.date);
                        }
                        if (object.bodyweight != null) {
                            if (typeof object.bodyweight !== "object")
                                throw TypeError(".LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.bodyweight: object expected");
                            message.bodyweight = $root.LiftLog.Ui.Models.DecimalValue.fromObject(object.bodyweight);
                        }
                        if (object.blueprintNotes != null)
                            message.blueprintNotes = String(object.blueprintNotes);
                        return message;
                    };

                    /**
                     * Creates a plain object from a SessionDaoV2 message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2} message SessionDaoV2
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    SessionDaoV2.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.recordedExercises = [];
                        if (options.defaults) {
                            object.id = null;
                            object.sessionName = "";
                            object.date = null;
                            object.blueprintNotes = "";
                        }
                        if (message.id != null && message.hasOwnProperty("id"))
                            object.id = $root.LiftLog.Ui.Models.UuidDao.toObject(message.id, options);
                        if (message.sessionName != null && message.hasOwnProperty("sessionName"))
                            object.sessionName = message.sessionName;
                        if (message.recordedExercises && message.recordedExercises.length) {
                            object.recordedExercises = [];
                            for (let j = 0; j < message.recordedExercises.length; ++j)
                                object.recordedExercises[j] = $root.LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2.toObject(message.recordedExercises[j], options);
                        }
                        if (message.date != null && message.hasOwnProperty("date"))
                            object.date = $root.LiftLog.Ui.Models.DateOnlyDao.toObject(message.date, options);
                        if (message.bodyweight != null && message.hasOwnProperty("bodyweight")) {
                            object.bodyweight = $root.LiftLog.Ui.Models.DecimalValue.toObject(message.bodyweight, options);
                            if (options.oneofs)
                                object._bodyweight = "bodyweight";
                        }
                        if (message.blueprintNotes != null && message.hasOwnProperty("blueprintNotes"))
                            object.blueprintNotes = message.blueprintNotes;
                        return object;
                    };

                    /**
                     * Converts this SessionDaoV2 to JSON.
                     * @function toJSON
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    SessionDaoV2.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for SessionDaoV2
                     * @function getTypeUrl
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    SessionDaoV2.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2";
                    };

                    return SessionDaoV2;
                })();

                SessionHistoryDao.RecordedExerciseDaoV2 = (function() {

                    /**
                     * Properties of a RecordedExerciseDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao
                     * @interface IRecordedExerciseDaoV2
                     * @property {LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2|null} [exerciseBlueprint] RecordedExerciseDaoV2 exerciseBlueprint
                     * @property {LiftLog.Ui.Models.IDecimalValue|null} [weight] RecordedExerciseDaoV2 weight
                     * @property {Array.<LiftLog.Ui.Models.SessionHistoryDao.IPotentialSetDaoV2>|null} [potentialSets] RecordedExerciseDaoV2 potentialSets
                     * @property {google.protobuf.IStringValue|null} [notes] RecordedExerciseDaoV2 notes
                     */

                    /**
                     * Constructs a new RecordedExerciseDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao
                     * @classdesc Represents a RecordedExerciseDaoV2.
                     * @implements IRecordedExerciseDaoV2
                     * @constructor
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2=} [properties] Properties to set
                     */
                    function RecordedExerciseDaoV2(properties) {
                        this.potentialSets = [];
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * RecordedExerciseDaoV2 exerciseBlueprint.
                     * @member {LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2|null|undefined} exerciseBlueprint
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2
                     * @instance
                     */
                    RecordedExerciseDaoV2.prototype.exerciseBlueprint = null;

                    /**
                     * RecordedExerciseDaoV2 weight.
                     * @member {LiftLog.Ui.Models.IDecimalValue|null|undefined} weight
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2
                     * @instance
                     */
                    RecordedExerciseDaoV2.prototype.weight = null;

                    /**
                     * RecordedExerciseDaoV2 potentialSets.
                     * @member {Array.<LiftLog.Ui.Models.SessionHistoryDao.IPotentialSetDaoV2>} potentialSets
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2
                     * @instance
                     */
                    RecordedExerciseDaoV2.prototype.potentialSets = $util.emptyArray;

                    /**
                     * RecordedExerciseDaoV2 notes.
                     * @member {google.protobuf.IStringValue|null|undefined} notes
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2
                     * @instance
                     */
                    RecordedExerciseDaoV2.prototype.notes = null;

                    // OneOf field names bound to virtual getters and setters
                    let $oneOfFields;

                    /**
                     * RecordedExerciseDaoV2 _weight.
                     * @member {"weight"|undefined} _weight
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2
                     * @instance
                     */
                    Object.defineProperty(RecordedExerciseDaoV2.prototype, "_weight", {
                        get: $util.oneOfGetter($oneOfFields = ["weight"]),
                        set: $util.oneOfSetter($oneOfFields)
                    });

                    /**
                     * RecordedExerciseDaoV2 _notes.
                     * @member {"notes"|undefined} _notes
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2
                     * @instance
                     */
                    Object.defineProperty(RecordedExerciseDaoV2.prototype, "_notes", {
                        get: $util.oneOfGetter($oneOfFields = ["notes"]),
                        set: $util.oneOfSetter($oneOfFields)
                    });

                    /**
                     * Creates a new RecordedExerciseDaoV2 instance using the specified properties.
                     * @function create
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2=} [properties] Properties to set
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2} RecordedExerciseDaoV2 instance
                     */
                    RecordedExerciseDaoV2.create = function create(properties) {
                        return new RecordedExerciseDaoV2(properties);
                    };

                    /**
                     * Encodes the specified RecordedExerciseDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2.verify|verify} messages.
                     * @function encode
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2} message RecordedExerciseDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    RecordedExerciseDaoV2.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.exerciseBlueprint != null && Object.hasOwnProperty.call(message, "exerciseBlueprint"))
                            $root.LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2.encode(message.exerciseBlueprint, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        if (message.weight != null && Object.hasOwnProperty.call(message, "weight"))
                            $root.LiftLog.Ui.Models.DecimalValue.encode(message.weight, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                        if (message.potentialSets != null && message.potentialSets.length)
                            for (let i = 0; i < message.potentialSets.length; ++i)
                                $root.LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2.encode(message.potentialSets[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                        if (message.notes != null && Object.hasOwnProperty.call(message, "notes"))
                            $root.google.protobuf.StringValue.encode(message.notes, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified RecordedExerciseDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2} message RecordedExerciseDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    RecordedExerciseDaoV2.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a RecordedExerciseDaoV2 message from the specified reader or buffer.
                     * @function decode
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2} RecordedExerciseDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    RecordedExerciseDaoV2.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    message.exerciseBlueprint = $root.LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2.decode(reader, reader.uint32());
                                    break;
                                }
                            case 2: {
                                    message.weight = $root.LiftLog.Ui.Models.DecimalValue.decode(reader, reader.uint32());
                                    break;
                                }
                            case 3: {
                                    if (!(message.potentialSets && message.potentialSets.length))
                                        message.potentialSets = [];
                                    message.potentialSets.push($root.LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 4: {
                                    message.notes = $root.google.protobuf.StringValue.decode(reader, reader.uint32());
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a RecordedExerciseDaoV2 message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2} RecordedExerciseDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    RecordedExerciseDaoV2.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a RecordedExerciseDaoV2 message.
                     * @function verify
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    RecordedExerciseDaoV2.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        let properties = {};
                        if (message.exerciseBlueprint != null && message.hasOwnProperty("exerciseBlueprint")) {
                            let error = $root.LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2.verify(message.exerciseBlueprint);
                            if (error)
                                return "exerciseBlueprint." + error;
                        }
                        if (message.weight != null && message.hasOwnProperty("weight")) {
                            properties._weight = 1;
                            {
                                let error = $root.LiftLog.Ui.Models.DecimalValue.verify(message.weight);
                                if (error)
                                    return "weight." + error;
                            }
                        }
                        if (message.potentialSets != null && message.hasOwnProperty("potentialSets")) {
                            if (!Array.isArray(message.potentialSets))
                                return "potentialSets: array expected";
                            for (let i = 0; i < message.potentialSets.length; ++i) {
                                let error = $root.LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2.verify(message.potentialSets[i]);
                                if (error)
                                    return "potentialSets." + error;
                            }
                        }
                        if (message.notes != null && message.hasOwnProperty("notes")) {
                            properties._notes = 1;
                            {
                                let error = $root.google.protobuf.StringValue.verify(message.notes);
                                if (error)
                                    return "notes." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a RecordedExerciseDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2} RecordedExerciseDaoV2
                     */
                    RecordedExerciseDaoV2.fromObject = function fromObject(object) {
                        if (object instanceof $root.LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2)
                            return object;
                        let message = new $root.LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2();
                        if (object.exerciseBlueprint != null) {
                            if (typeof object.exerciseBlueprint !== "object")
                                throw TypeError(".LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2.exerciseBlueprint: object expected");
                            message.exerciseBlueprint = $root.LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2.fromObject(object.exerciseBlueprint);
                        }
                        if (object.weight != null) {
                            if (typeof object.weight !== "object")
                                throw TypeError(".LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2.weight: object expected");
                            message.weight = $root.LiftLog.Ui.Models.DecimalValue.fromObject(object.weight);
                        }
                        if (object.potentialSets) {
                            if (!Array.isArray(object.potentialSets))
                                throw TypeError(".LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2.potentialSets: array expected");
                            message.potentialSets = [];
                            for (let i = 0; i < object.potentialSets.length; ++i) {
                                if (typeof object.potentialSets[i] !== "object")
                                    throw TypeError(".LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2.potentialSets: object expected");
                                message.potentialSets[i] = $root.LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2.fromObject(object.potentialSets[i]);
                            }
                        }
                        if (object.notes != null) {
                            if (typeof object.notes !== "object")
                                throw TypeError(".LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2.notes: object expected");
                            message.notes = $root.google.protobuf.StringValue.fromObject(object.notes);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a RecordedExerciseDaoV2 message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2} message RecordedExerciseDaoV2
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    RecordedExerciseDaoV2.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.potentialSets = [];
                        if (options.defaults)
                            object.exerciseBlueprint = null;
                        if (message.exerciseBlueprint != null && message.hasOwnProperty("exerciseBlueprint"))
                            object.exerciseBlueprint = $root.LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2.toObject(message.exerciseBlueprint, options);
                        if (message.weight != null && message.hasOwnProperty("weight")) {
                            object.weight = $root.LiftLog.Ui.Models.DecimalValue.toObject(message.weight, options);
                            if (options.oneofs)
                                object._weight = "weight";
                        }
                        if (message.potentialSets && message.potentialSets.length) {
                            object.potentialSets = [];
                            for (let j = 0; j < message.potentialSets.length; ++j)
                                object.potentialSets[j] = $root.LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2.toObject(message.potentialSets[j], options);
                        }
                        if (message.notes != null && message.hasOwnProperty("notes")) {
                            object.notes = $root.google.protobuf.StringValue.toObject(message.notes, options);
                            if (options.oneofs)
                                object._notes = "notes";
                        }
                        return object;
                    };

                    /**
                     * Converts this RecordedExerciseDaoV2 to JSON.
                     * @function toJSON
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    RecordedExerciseDaoV2.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for RecordedExerciseDaoV2
                     * @function getTypeUrl
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    RecordedExerciseDaoV2.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2";
                    };

                    return RecordedExerciseDaoV2;
                })();

                SessionHistoryDao.PotentialSetDaoV2 = (function() {

                    /**
                     * Properties of a PotentialSetDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao
                     * @interface IPotentialSetDaoV2
                     * @property {LiftLog.Ui.Models.SessionHistoryDao.IRecordedSetDaoV2|null} [recordedSet] PotentialSetDaoV2 recordedSet
                     * @property {LiftLog.Ui.Models.IDecimalValue|null} [weight] PotentialSetDaoV2 weight
                     */

                    /**
                     * Constructs a new PotentialSetDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao
                     * @classdesc Represents a PotentialSetDaoV2.
                     * @implements IPotentialSetDaoV2
                     * @constructor
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.IPotentialSetDaoV2=} [properties] Properties to set
                     */
                    function PotentialSetDaoV2(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * PotentialSetDaoV2 recordedSet.
                     * @member {LiftLog.Ui.Models.SessionHistoryDao.IRecordedSetDaoV2|null|undefined} recordedSet
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2
                     * @instance
                     */
                    PotentialSetDaoV2.prototype.recordedSet = null;

                    /**
                     * PotentialSetDaoV2 weight.
                     * @member {LiftLog.Ui.Models.IDecimalValue|null|undefined} weight
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2
                     * @instance
                     */
                    PotentialSetDaoV2.prototype.weight = null;

                    // OneOf field names bound to virtual getters and setters
                    let $oneOfFields;

                    /**
                     * PotentialSetDaoV2 _recordedSet.
                     * @member {"recordedSet"|undefined} _recordedSet
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2
                     * @instance
                     */
                    Object.defineProperty(PotentialSetDaoV2.prototype, "_recordedSet", {
                        get: $util.oneOfGetter($oneOfFields = ["recordedSet"]),
                        set: $util.oneOfSetter($oneOfFields)
                    });

                    /**
                     * Creates a new PotentialSetDaoV2 instance using the specified properties.
                     * @function create
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.IPotentialSetDaoV2=} [properties] Properties to set
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2} PotentialSetDaoV2 instance
                     */
                    PotentialSetDaoV2.create = function create(properties) {
                        return new PotentialSetDaoV2(properties);
                    };

                    /**
                     * Encodes the specified PotentialSetDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2.verify|verify} messages.
                     * @function encode
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.IPotentialSetDaoV2} message PotentialSetDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    PotentialSetDaoV2.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.recordedSet != null && Object.hasOwnProperty.call(message, "recordedSet"))
                            $root.LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2.encode(message.recordedSet, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        if (message.weight != null && Object.hasOwnProperty.call(message, "weight"))
                            $root.LiftLog.Ui.Models.DecimalValue.encode(message.weight, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified PotentialSetDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.IPotentialSetDaoV2} message PotentialSetDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    PotentialSetDaoV2.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a PotentialSetDaoV2 message from the specified reader or buffer.
                     * @function decode
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2} PotentialSetDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    PotentialSetDaoV2.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    message.recordedSet = $root.LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2.decode(reader, reader.uint32());
                                    break;
                                }
                            case 2: {
                                    message.weight = $root.LiftLog.Ui.Models.DecimalValue.decode(reader, reader.uint32());
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a PotentialSetDaoV2 message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2} PotentialSetDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    PotentialSetDaoV2.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a PotentialSetDaoV2 message.
                     * @function verify
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    PotentialSetDaoV2.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        let properties = {};
                        if (message.recordedSet != null && message.hasOwnProperty("recordedSet")) {
                            properties._recordedSet = 1;
                            {
                                let error = $root.LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2.verify(message.recordedSet);
                                if (error)
                                    return "recordedSet." + error;
                            }
                        }
                        if (message.weight != null && message.hasOwnProperty("weight")) {
                            let error = $root.LiftLog.Ui.Models.DecimalValue.verify(message.weight);
                            if (error)
                                return "weight." + error;
                        }
                        return null;
                    };

                    /**
                     * Creates a PotentialSetDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2} PotentialSetDaoV2
                     */
                    PotentialSetDaoV2.fromObject = function fromObject(object) {
                        if (object instanceof $root.LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2)
                            return object;
                        let message = new $root.LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2();
                        if (object.recordedSet != null) {
                            if (typeof object.recordedSet !== "object")
                                throw TypeError(".LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2.recordedSet: object expected");
                            message.recordedSet = $root.LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2.fromObject(object.recordedSet);
                        }
                        if (object.weight != null) {
                            if (typeof object.weight !== "object")
                                throw TypeError(".LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2.weight: object expected");
                            message.weight = $root.LiftLog.Ui.Models.DecimalValue.fromObject(object.weight);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a PotentialSetDaoV2 message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2} message PotentialSetDaoV2
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    PotentialSetDaoV2.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults)
                            object.weight = null;
                        if (message.recordedSet != null && message.hasOwnProperty("recordedSet")) {
                            object.recordedSet = $root.LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2.toObject(message.recordedSet, options);
                            if (options.oneofs)
                                object._recordedSet = "recordedSet";
                        }
                        if (message.weight != null && message.hasOwnProperty("weight"))
                            object.weight = $root.LiftLog.Ui.Models.DecimalValue.toObject(message.weight, options);
                        return object;
                    };

                    /**
                     * Converts this PotentialSetDaoV2 to JSON.
                     * @function toJSON
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    PotentialSetDaoV2.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for PotentialSetDaoV2
                     * @function getTypeUrl
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    PotentialSetDaoV2.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2";
                    };

                    return PotentialSetDaoV2;
                })();

                SessionHistoryDao.RecordedSetDaoV2 = (function() {

                    /**
                     * Properties of a RecordedSetDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao
                     * @interface IRecordedSetDaoV2
                     * @property {number|null} [repsCompleted] RecordedSetDaoV2 repsCompleted
                     * @property {LiftLog.Ui.Models.ITimeOnlyDao|null} [completionTime] RecordedSetDaoV2 completionTime
                     * @property {LiftLog.Ui.Models.IDateOnlyDao|null} [completionDate] RecordedSetDaoV2 completionDate
                     */

                    /**
                     * Constructs a new RecordedSetDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao
                     * @classdesc Represents a RecordedSetDaoV2.
                     * @implements IRecordedSetDaoV2
                     * @constructor
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.IRecordedSetDaoV2=} [properties] Properties to set
                     */
                    function RecordedSetDaoV2(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * RecordedSetDaoV2 repsCompleted.
                     * @member {number} repsCompleted
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2
                     * @instance
                     */
                    RecordedSetDaoV2.prototype.repsCompleted = 0;

                    /**
                     * RecordedSetDaoV2 completionTime.
                     * @member {LiftLog.Ui.Models.ITimeOnlyDao|null|undefined} completionTime
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2
                     * @instance
                     */
                    RecordedSetDaoV2.prototype.completionTime = null;

                    /**
                     * RecordedSetDaoV2 completionDate.
                     * @member {LiftLog.Ui.Models.IDateOnlyDao|null|undefined} completionDate
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2
                     * @instance
                     */
                    RecordedSetDaoV2.prototype.completionDate = null;

                    // OneOf field names bound to virtual getters and setters
                    let $oneOfFields;

                    /**
                     * RecordedSetDaoV2 _completionDate.
                     * @member {"completionDate"|undefined} _completionDate
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2
                     * @instance
                     */
                    Object.defineProperty(RecordedSetDaoV2.prototype, "_completionDate", {
                        get: $util.oneOfGetter($oneOfFields = ["completionDate"]),
                        set: $util.oneOfSetter($oneOfFields)
                    });

                    /**
                     * Creates a new RecordedSetDaoV2 instance using the specified properties.
                     * @function create
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.IRecordedSetDaoV2=} [properties] Properties to set
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2} RecordedSetDaoV2 instance
                     */
                    RecordedSetDaoV2.create = function create(properties) {
                        return new RecordedSetDaoV2(properties);
                    };

                    /**
                     * Encodes the specified RecordedSetDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2.verify|verify} messages.
                     * @function encode
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.IRecordedSetDaoV2} message RecordedSetDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    RecordedSetDaoV2.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.repsCompleted != null && Object.hasOwnProperty.call(message, "repsCompleted"))
                            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.repsCompleted);
                        if (message.completionTime != null && Object.hasOwnProperty.call(message, "completionTime"))
                            $root.LiftLog.Ui.Models.TimeOnlyDao.encode(message.completionTime, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                        if (message.completionDate != null && Object.hasOwnProperty.call(message, "completionDate"))
                            $root.LiftLog.Ui.Models.DateOnlyDao.encode(message.completionDate, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified RecordedSetDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.IRecordedSetDaoV2} message RecordedSetDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    RecordedSetDaoV2.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a RecordedSetDaoV2 message from the specified reader or buffer.
                     * @function decode
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2} RecordedSetDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    RecordedSetDaoV2.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    message.repsCompleted = reader.int32();
                                    break;
                                }
                            case 2: {
                                    message.completionTime = $root.LiftLog.Ui.Models.TimeOnlyDao.decode(reader, reader.uint32());
                                    break;
                                }
                            case 3: {
                                    message.completionDate = $root.LiftLog.Ui.Models.DateOnlyDao.decode(reader, reader.uint32());
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a RecordedSetDaoV2 message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2} RecordedSetDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    RecordedSetDaoV2.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a RecordedSetDaoV2 message.
                     * @function verify
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    RecordedSetDaoV2.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        let properties = {};
                        if (message.repsCompleted != null && message.hasOwnProperty("repsCompleted"))
                            if (!$util.isInteger(message.repsCompleted))
                                return "repsCompleted: integer expected";
                        if (message.completionTime != null && message.hasOwnProperty("completionTime")) {
                            let error = $root.LiftLog.Ui.Models.TimeOnlyDao.verify(message.completionTime);
                            if (error)
                                return "completionTime." + error;
                        }
                        if (message.completionDate != null && message.hasOwnProperty("completionDate")) {
                            properties._completionDate = 1;
                            {
                                let error = $root.LiftLog.Ui.Models.DateOnlyDao.verify(message.completionDate);
                                if (error)
                                    return "completionDate." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a RecordedSetDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2} RecordedSetDaoV2
                     */
                    RecordedSetDaoV2.fromObject = function fromObject(object) {
                        if (object instanceof $root.LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2)
                            return object;
                        let message = new $root.LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2();
                        if (object.repsCompleted != null)
                            message.repsCompleted = object.repsCompleted | 0;
                        if (object.completionTime != null) {
                            if (typeof object.completionTime !== "object")
                                throw TypeError(".LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2.completionTime: object expected");
                            message.completionTime = $root.LiftLog.Ui.Models.TimeOnlyDao.fromObject(object.completionTime);
                        }
                        if (object.completionDate != null) {
                            if (typeof object.completionDate !== "object")
                                throw TypeError(".LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2.completionDate: object expected");
                            message.completionDate = $root.LiftLog.Ui.Models.DateOnlyDao.fromObject(object.completionDate);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a RecordedSetDaoV2 message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2} message RecordedSetDaoV2
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    RecordedSetDaoV2.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            object.repsCompleted = 0;
                            object.completionTime = null;
                        }
                        if (message.repsCompleted != null && message.hasOwnProperty("repsCompleted"))
                            object.repsCompleted = message.repsCompleted;
                        if (message.completionTime != null && message.hasOwnProperty("completionTime"))
                            object.completionTime = $root.LiftLog.Ui.Models.TimeOnlyDao.toObject(message.completionTime, options);
                        if (message.completionDate != null && message.hasOwnProperty("completionDate")) {
                            object.completionDate = $root.LiftLog.Ui.Models.DateOnlyDao.toObject(message.completionDate, options);
                            if (options.oneofs)
                                object._completionDate = "completionDate";
                        }
                        return object;
                    };

                    /**
                     * Converts this RecordedSetDaoV2 to JSON.
                     * @function toJSON
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    RecordedSetDaoV2.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for RecordedSetDaoV2
                     * @function getTypeUrl
                     * @memberof LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    RecordedSetDaoV2.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2";
                    };

                    return RecordedSetDaoV2;
                })();

                return SessionHistoryDao;
            })();

            Models.SessionBlueprintDao = (function() {

                /**
                 * Namespace SessionBlueprintDao.
                 * @memberof LiftLog.Ui.Models
                 * @namespace
                 */
                const SessionBlueprintDao = {};

                SessionBlueprintDao.SessionBlueprintContainerDaoV2 = (function() {

                    /**
                     * Properties of a SessionBlueprintContainerDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao
                     * @interface ISessionBlueprintContainerDaoV2
                     * @property {Array.<LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2>|null} [sessionBlueprints] SessionBlueprintContainerDaoV2 sessionBlueprints
                     */

                    /**
                     * Constructs a new SessionBlueprintContainerDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao
                     * @classdesc Represents a SessionBlueprintContainerDaoV2.
                     * @implements ISessionBlueprintContainerDaoV2
                     * @constructor
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintContainerDaoV2=} [properties] Properties to set
                     */
                    function SessionBlueprintContainerDaoV2(properties) {
                        this.sessionBlueprints = [];
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * SessionBlueprintContainerDaoV2 sessionBlueprints.
                     * @member {Array.<LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2>} sessionBlueprints
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2
                     * @instance
                     */
                    SessionBlueprintContainerDaoV2.prototype.sessionBlueprints = $util.emptyArray;

                    /**
                     * Creates a new SessionBlueprintContainerDaoV2 instance using the specified properties.
                     * @function create
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintContainerDaoV2=} [properties] Properties to set
                     * @returns {LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2} SessionBlueprintContainerDaoV2 instance
                     */
                    SessionBlueprintContainerDaoV2.create = function create(properties) {
                        return new SessionBlueprintContainerDaoV2(properties);
                    };

                    /**
                     * Encodes the specified SessionBlueprintContainerDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2.verify|verify} messages.
                     * @function encode
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintContainerDaoV2} message SessionBlueprintContainerDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    SessionBlueprintContainerDaoV2.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.sessionBlueprints != null && message.sessionBlueprints.length)
                            for (let i = 0; i < message.sessionBlueprints.length; ++i)
                                $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.encode(message.sessionBlueprints[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified SessionBlueprintContainerDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintContainerDaoV2} message SessionBlueprintContainerDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    SessionBlueprintContainerDaoV2.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a SessionBlueprintContainerDaoV2 message from the specified reader or buffer.
                     * @function decode
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2} SessionBlueprintContainerDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    SessionBlueprintContainerDaoV2.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    if (!(message.sessionBlueprints && message.sessionBlueprints.length))
                                        message.sessionBlueprints = [];
                                    message.sessionBlueprints.push($root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.decode(reader, reader.uint32()));
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a SessionBlueprintContainerDaoV2 message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2} SessionBlueprintContainerDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    SessionBlueprintContainerDaoV2.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a SessionBlueprintContainerDaoV2 message.
                     * @function verify
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    SessionBlueprintContainerDaoV2.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.sessionBlueprints != null && message.hasOwnProperty("sessionBlueprints")) {
                            if (!Array.isArray(message.sessionBlueprints))
                                return "sessionBlueprints: array expected";
                            for (let i = 0; i < message.sessionBlueprints.length; ++i) {
                                let error = $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.verify(message.sessionBlueprints[i]);
                                if (error)
                                    return "sessionBlueprints." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a SessionBlueprintContainerDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2} SessionBlueprintContainerDaoV2
                     */
                    SessionBlueprintContainerDaoV2.fromObject = function fromObject(object) {
                        if (object instanceof $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2)
                            return object;
                        let message = new $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2();
                        if (object.sessionBlueprints) {
                            if (!Array.isArray(object.sessionBlueprints))
                                throw TypeError(".LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2.sessionBlueprints: array expected");
                            message.sessionBlueprints = [];
                            for (let i = 0; i < object.sessionBlueprints.length; ++i) {
                                if (typeof object.sessionBlueprints[i] !== "object")
                                    throw TypeError(".LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2.sessionBlueprints: object expected");
                                message.sessionBlueprints[i] = $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.fromObject(object.sessionBlueprints[i]);
                            }
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a SessionBlueprintContainerDaoV2 message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2} message SessionBlueprintContainerDaoV2
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    SessionBlueprintContainerDaoV2.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.sessionBlueprints = [];
                        if (message.sessionBlueprints && message.sessionBlueprints.length) {
                            object.sessionBlueprints = [];
                            for (let j = 0; j < message.sessionBlueprints.length; ++j)
                                object.sessionBlueprints[j] = $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.toObject(message.sessionBlueprints[j], options);
                        }
                        return object;
                    };

                    /**
                     * Converts this SessionBlueprintContainerDaoV2 to JSON.
                     * @function toJSON
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    SessionBlueprintContainerDaoV2.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for SessionBlueprintContainerDaoV2
                     * @function getTypeUrl
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    SessionBlueprintContainerDaoV2.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2";
                    };

                    return SessionBlueprintContainerDaoV2;
                })();

                SessionBlueprintDao.SessionBlueprintDaoV2 = (function() {

                    /**
                     * Properties of a SessionBlueprintDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao
                     * @interface ISessionBlueprintDaoV2
                     * @property {string|null} [name] SessionBlueprintDaoV2 name
                     * @property {Array.<LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2>|null} [exerciseBlueprints] SessionBlueprintDaoV2 exerciseBlueprints
                     * @property {string|null} [notes] SessionBlueprintDaoV2 notes
                     */

                    /**
                     * Constructs a new SessionBlueprintDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao
                     * @classdesc Represents a SessionBlueprintDaoV2.
                     * @implements ISessionBlueprintDaoV2
                     * @constructor
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2=} [properties] Properties to set
                     */
                    function SessionBlueprintDaoV2(properties) {
                        this.exerciseBlueprints = [];
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * SessionBlueprintDaoV2 name.
                     * @member {string} name
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2
                     * @instance
                     */
                    SessionBlueprintDaoV2.prototype.name = "";

                    /**
                     * SessionBlueprintDaoV2 exerciseBlueprints.
                     * @member {Array.<LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2>} exerciseBlueprints
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2
                     * @instance
                     */
                    SessionBlueprintDaoV2.prototype.exerciseBlueprints = $util.emptyArray;

                    /**
                     * SessionBlueprintDaoV2 notes.
                     * @member {string} notes
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2
                     * @instance
                     */
                    SessionBlueprintDaoV2.prototype.notes = "";

                    /**
                     * Creates a new SessionBlueprintDaoV2 instance using the specified properties.
                     * @function create
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2=} [properties] Properties to set
                     * @returns {LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2} SessionBlueprintDaoV2 instance
                     */
                    SessionBlueprintDaoV2.create = function create(properties) {
                        return new SessionBlueprintDaoV2(properties);
                    };

                    /**
                     * Encodes the specified SessionBlueprintDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.verify|verify} messages.
                     * @function encode
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2} message SessionBlueprintDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    SessionBlueprintDaoV2.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                        if (message.exerciseBlueprints != null && message.exerciseBlueprints.length)
                            for (let i = 0; i < message.exerciseBlueprints.length; ++i)
                                $root.LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2.encode(message.exerciseBlueprints[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                        if (message.notes != null && Object.hasOwnProperty.call(message, "notes"))
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.notes);
                        return writer;
                    };

                    /**
                     * Encodes the specified SessionBlueprintDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2} message SessionBlueprintDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    SessionBlueprintDaoV2.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a SessionBlueprintDaoV2 message from the specified reader or buffer.
                     * @function decode
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2} SessionBlueprintDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    SessionBlueprintDaoV2.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    message.name = reader.string();
                                    break;
                                }
                            case 2: {
                                    if (!(message.exerciseBlueprints && message.exerciseBlueprints.length))
                                        message.exerciseBlueprints = [];
                                    message.exerciseBlueprints.push($root.LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 3: {
                                    message.notes = reader.string();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a SessionBlueprintDaoV2 message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2} SessionBlueprintDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    SessionBlueprintDaoV2.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a SessionBlueprintDaoV2 message.
                     * @function verify
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    SessionBlueprintDaoV2.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.name != null && message.hasOwnProperty("name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.exerciseBlueprints != null && message.hasOwnProperty("exerciseBlueprints")) {
                            if (!Array.isArray(message.exerciseBlueprints))
                                return "exerciseBlueprints: array expected";
                            for (let i = 0; i < message.exerciseBlueprints.length; ++i) {
                                let error = $root.LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2.verify(message.exerciseBlueprints[i]);
                                if (error)
                                    return "exerciseBlueprints." + error;
                            }
                        }
                        if (message.notes != null && message.hasOwnProperty("notes"))
                            if (!$util.isString(message.notes))
                                return "notes: string expected";
                        return null;
                    };

                    /**
                     * Creates a SessionBlueprintDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2} SessionBlueprintDaoV2
                     */
                    SessionBlueprintDaoV2.fromObject = function fromObject(object) {
                        if (object instanceof $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2)
                            return object;
                        let message = new $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2();
                        if (object.name != null)
                            message.name = String(object.name);
                        if (object.exerciseBlueprints) {
                            if (!Array.isArray(object.exerciseBlueprints))
                                throw TypeError(".LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.exerciseBlueprints: array expected");
                            message.exerciseBlueprints = [];
                            for (let i = 0; i < object.exerciseBlueprints.length; ++i) {
                                if (typeof object.exerciseBlueprints[i] !== "object")
                                    throw TypeError(".LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.exerciseBlueprints: object expected");
                                message.exerciseBlueprints[i] = $root.LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2.fromObject(object.exerciseBlueprints[i]);
                            }
                        }
                        if (object.notes != null)
                            message.notes = String(object.notes);
                        return message;
                    };

                    /**
                     * Creates a plain object from a SessionBlueprintDaoV2 message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2} message SessionBlueprintDaoV2
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    SessionBlueprintDaoV2.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.exerciseBlueprints = [];
                        if (options.defaults) {
                            object.name = "";
                            object.notes = "";
                        }
                        if (message.name != null && message.hasOwnProperty("name"))
                            object.name = message.name;
                        if (message.exerciseBlueprints && message.exerciseBlueprints.length) {
                            object.exerciseBlueprints = [];
                            for (let j = 0; j < message.exerciseBlueprints.length; ++j)
                                object.exerciseBlueprints[j] = $root.LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2.toObject(message.exerciseBlueprints[j], options);
                        }
                        if (message.notes != null && message.hasOwnProperty("notes"))
                            object.notes = message.notes;
                        return object;
                    };

                    /**
                     * Converts this SessionBlueprintDaoV2 to JSON.
                     * @function toJSON
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    SessionBlueprintDaoV2.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for SessionBlueprintDaoV2
                     * @function getTypeUrl
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    SessionBlueprintDaoV2.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2";
                    };

                    return SessionBlueprintDaoV2;
                })();

                SessionBlueprintDao.ExerciseBlueprintDaoV2 = (function() {

                    /**
                     * Properties of an ExerciseBlueprintDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao
                     * @interface IExerciseBlueprintDaoV2
                     * @property {string|null} [name] ExerciseBlueprintDaoV2 name
                     * @property {number|null} [sets] ExerciseBlueprintDaoV2 sets
                     * @property {number|null} [repsPerSet] ExerciseBlueprintDaoV2 repsPerSet
                     * @property {LiftLog.Ui.Models.IDecimalValue|null} [weightIncreaseOnSuccess] ExerciseBlueprintDaoV2 weightIncreaseOnSuccess
                     * @property {LiftLog.Ui.Models.SessionBlueprintDao.IRestDaoV2|null} [restBetweenSets] ExerciseBlueprintDaoV2 restBetweenSets
                     * @property {boolean|null} [supersetWithNext] ExerciseBlueprintDaoV2 supersetWithNext
                     * @property {string|null} [notes] ExerciseBlueprintDaoV2 notes
                     * @property {string|null} [link] ExerciseBlueprintDaoV2 link
                     */

                    /**
                     * Constructs a new ExerciseBlueprintDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao
                     * @classdesc Represents an ExerciseBlueprintDaoV2.
                     * @implements IExerciseBlueprintDaoV2
                     * @constructor
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2=} [properties] Properties to set
                     */
                    function ExerciseBlueprintDaoV2(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * ExerciseBlueprintDaoV2 name.
                     * @member {string} name
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @instance
                     */
                    ExerciseBlueprintDaoV2.prototype.name = "";

                    /**
                     * ExerciseBlueprintDaoV2 sets.
                     * @member {number} sets
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @instance
                     */
                    ExerciseBlueprintDaoV2.prototype.sets = 0;

                    /**
                     * ExerciseBlueprintDaoV2 repsPerSet.
                     * @member {number} repsPerSet
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @instance
                     */
                    ExerciseBlueprintDaoV2.prototype.repsPerSet = 0;

                    /**
                     * ExerciseBlueprintDaoV2 weightIncreaseOnSuccess.
                     * @member {LiftLog.Ui.Models.IDecimalValue|null|undefined} weightIncreaseOnSuccess
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @instance
                     */
                    ExerciseBlueprintDaoV2.prototype.weightIncreaseOnSuccess = null;

                    /**
                     * ExerciseBlueprintDaoV2 restBetweenSets.
                     * @member {LiftLog.Ui.Models.SessionBlueprintDao.IRestDaoV2|null|undefined} restBetweenSets
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @instance
                     */
                    ExerciseBlueprintDaoV2.prototype.restBetweenSets = null;

                    /**
                     * ExerciseBlueprintDaoV2 supersetWithNext.
                     * @member {boolean} supersetWithNext
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @instance
                     */
                    ExerciseBlueprintDaoV2.prototype.supersetWithNext = false;

                    /**
                     * ExerciseBlueprintDaoV2 notes.
                     * @member {string} notes
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @instance
                     */
                    ExerciseBlueprintDaoV2.prototype.notes = "";

                    /**
                     * ExerciseBlueprintDaoV2 link.
                     * @member {string} link
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @instance
                     */
                    ExerciseBlueprintDaoV2.prototype.link = "";

                    /**
                     * Creates a new ExerciseBlueprintDaoV2 instance using the specified properties.
                     * @function create
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2=} [properties] Properties to set
                     * @returns {LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2} ExerciseBlueprintDaoV2 instance
                     */
                    ExerciseBlueprintDaoV2.create = function create(properties) {
                        return new ExerciseBlueprintDaoV2(properties);
                    };

                    /**
                     * Encodes the specified ExerciseBlueprintDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2.verify|verify} messages.
                     * @function encode
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2} message ExerciseBlueprintDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ExerciseBlueprintDaoV2.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                        if (message.sets != null && Object.hasOwnProperty.call(message, "sets"))
                            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.sets);
                        if (message.repsPerSet != null && Object.hasOwnProperty.call(message, "repsPerSet"))
                            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.repsPerSet);
                        if (message.weightIncreaseOnSuccess != null && Object.hasOwnProperty.call(message, "weightIncreaseOnSuccess"))
                            $root.LiftLog.Ui.Models.DecimalValue.encode(message.weightIncreaseOnSuccess, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                        if (message.restBetweenSets != null && Object.hasOwnProperty.call(message, "restBetweenSets"))
                            $root.LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2.encode(message.restBetweenSets, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                        if (message.supersetWithNext != null && Object.hasOwnProperty.call(message, "supersetWithNext"))
                            writer.uint32(/* id 7, wireType 0 =*/56).bool(message.supersetWithNext);
                        if (message.notes != null && Object.hasOwnProperty.call(message, "notes"))
                            writer.uint32(/* id 8, wireType 2 =*/66).string(message.notes);
                        if (message.link != null && Object.hasOwnProperty.call(message, "link"))
                            writer.uint32(/* id 9, wireType 2 =*/74).string(message.link);
                        return writer;
                    };

                    /**
                     * Encodes the specified ExerciseBlueprintDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2} message ExerciseBlueprintDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ExerciseBlueprintDaoV2.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes an ExerciseBlueprintDaoV2 message from the specified reader or buffer.
                     * @function decode
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2} ExerciseBlueprintDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ExerciseBlueprintDaoV2.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    message.name = reader.string();
                                    break;
                                }
                            case 2: {
                                    message.sets = reader.int32();
                                    break;
                                }
                            case 3: {
                                    message.repsPerSet = reader.int32();
                                    break;
                                }
                            case 5: {
                                    message.weightIncreaseOnSuccess = $root.LiftLog.Ui.Models.DecimalValue.decode(reader, reader.uint32());
                                    break;
                                }
                            case 6: {
                                    message.restBetweenSets = $root.LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2.decode(reader, reader.uint32());
                                    break;
                                }
                            case 7: {
                                    message.supersetWithNext = reader.bool();
                                    break;
                                }
                            case 8: {
                                    message.notes = reader.string();
                                    break;
                                }
                            case 9: {
                                    message.link = reader.string();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes an ExerciseBlueprintDaoV2 message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2} ExerciseBlueprintDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ExerciseBlueprintDaoV2.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an ExerciseBlueprintDaoV2 message.
                     * @function verify
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    ExerciseBlueprintDaoV2.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.name != null && message.hasOwnProperty("name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.sets != null && message.hasOwnProperty("sets"))
                            if (!$util.isInteger(message.sets))
                                return "sets: integer expected";
                        if (message.repsPerSet != null && message.hasOwnProperty("repsPerSet"))
                            if (!$util.isInteger(message.repsPerSet))
                                return "repsPerSet: integer expected";
                        if (message.weightIncreaseOnSuccess != null && message.hasOwnProperty("weightIncreaseOnSuccess")) {
                            let error = $root.LiftLog.Ui.Models.DecimalValue.verify(message.weightIncreaseOnSuccess);
                            if (error)
                                return "weightIncreaseOnSuccess." + error;
                        }
                        if (message.restBetweenSets != null && message.hasOwnProperty("restBetweenSets")) {
                            let error = $root.LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2.verify(message.restBetweenSets);
                            if (error)
                                return "restBetweenSets." + error;
                        }
                        if (message.supersetWithNext != null && message.hasOwnProperty("supersetWithNext"))
                            if (typeof message.supersetWithNext !== "boolean")
                                return "supersetWithNext: boolean expected";
                        if (message.notes != null && message.hasOwnProperty("notes"))
                            if (!$util.isString(message.notes))
                                return "notes: string expected";
                        if (message.link != null && message.hasOwnProperty("link"))
                            if (!$util.isString(message.link))
                                return "link: string expected";
                        return null;
                    };

                    /**
                     * Creates an ExerciseBlueprintDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2} ExerciseBlueprintDaoV2
                     */
                    ExerciseBlueprintDaoV2.fromObject = function fromObject(object) {
                        if (object instanceof $root.LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2)
                            return object;
                        let message = new $root.LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2();
                        if (object.name != null)
                            message.name = String(object.name);
                        if (object.sets != null)
                            message.sets = object.sets | 0;
                        if (object.repsPerSet != null)
                            message.repsPerSet = object.repsPerSet | 0;
                        if (object.weightIncreaseOnSuccess != null) {
                            if (typeof object.weightIncreaseOnSuccess !== "object")
                                throw TypeError(".LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2.weightIncreaseOnSuccess: object expected");
                            message.weightIncreaseOnSuccess = $root.LiftLog.Ui.Models.DecimalValue.fromObject(object.weightIncreaseOnSuccess);
                        }
                        if (object.restBetweenSets != null) {
                            if (typeof object.restBetweenSets !== "object")
                                throw TypeError(".LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2.restBetweenSets: object expected");
                            message.restBetweenSets = $root.LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2.fromObject(object.restBetweenSets);
                        }
                        if (object.supersetWithNext != null)
                            message.supersetWithNext = Boolean(object.supersetWithNext);
                        if (object.notes != null)
                            message.notes = String(object.notes);
                        if (object.link != null)
                            message.link = String(object.link);
                        return message;
                    };

                    /**
                     * Creates a plain object from an ExerciseBlueprintDaoV2 message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2} message ExerciseBlueprintDaoV2
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    ExerciseBlueprintDaoV2.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            object.name = "";
                            object.sets = 0;
                            object.repsPerSet = 0;
                            object.weightIncreaseOnSuccess = null;
                            object.restBetweenSets = null;
                            object.supersetWithNext = false;
                            object.notes = "";
                            object.link = "";
                        }
                        if (message.name != null && message.hasOwnProperty("name"))
                            object.name = message.name;
                        if (message.sets != null && message.hasOwnProperty("sets"))
                            object.sets = message.sets;
                        if (message.repsPerSet != null && message.hasOwnProperty("repsPerSet"))
                            object.repsPerSet = message.repsPerSet;
                        if (message.weightIncreaseOnSuccess != null && message.hasOwnProperty("weightIncreaseOnSuccess"))
                            object.weightIncreaseOnSuccess = $root.LiftLog.Ui.Models.DecimalValue.toObject(message.weightIncreaseOnSuccess, options);
                        if (message.restBetweenSets != null && message.hasOwnProperty("restBetweenSets"))
                            object.restBetweenSets = $root.LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2.toObject(message.restBetweenSets, options);
                        if (message.supersetWithNext != null && message.hasOwnProperty("supersetWithNext"))
                            object.supersetWithNext = message.supersetWithNext;
                        if (message.notes != null && message.hasOwnProperty("notes"))
                            object.notes = message.notes;
                        if (message.link != null && message.hasOwnProperty("link"))
                            object.link = message.link;
                        return object;
                    };

                    /**
                     * Converts this ExerciseBlueprintDaoV2 to JSON.
                     * @function toJSON
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    ExerciseBlueprintDaoV2.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for ExerciseBlueprintDaoV2
                     * @function getTypeUrl
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    ExerciseBlueprintDaoV2.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2";
                    };

                    return ExerciseBlueprintDaoV2;
                })();

                SessionBlueprintDao.RestDaoV2 = (function() {

                    /**
                     * Properties of a RestDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao
                     * @interface IRestDaoV2
                     * @property {google.protobuf.IDuration|null} [minRest] RestDaoV2 minRest
                     * @property {google.protobuf.IDuration|null} [maxRest] RestDaoV2 maxRest
                     * @property {google.protobuf.IDuration|null} [failureRest] RestDaoV2 failureRest
                     */

                    /**
                     * Constructs a new RestDaoV2.
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao
                     * @classdesc Represents a RestDaoV2.
                     * @implements IRestDaoV2
                     * @constructor
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.IRestDaoV2=} [properties] Properties to set
                     */
                    function RestDaoV2(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * RestDaoV2 minRest.
                     * @member {google.protobuf.IDuration|null|undefined} minRest
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2
                     * @instance
                     */
                    RestDaoV2.prototype.minRest = null;

                    /**
                     * RestDaoV2 maxRest.
                     * @member {google.protobuf.IDuration|null|undefined} maxRest
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2
                     * @instance
                     */
                    RestDaoV2.prototype.maxRest = null;

                    /**
                     * RestDaoV2 failureRest.
                     * @member {google.protobuf.IDuration|null|undefined} failureRest
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2
                     * @instance
                     */
                    RestDaoV2.prototype.failureRest = null;

                    /**
                     * Creates a new RestDaoV2 instance using the specified properties.
                     * @function create
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.IRestDaoV2=} [properties] Properties to set
                     * @returns {LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2} RestDaoV2 instance
                     */
                    RestDaoV2.create = function create(properties) {
                        return new RestDaoV2(properties);
                    };

                    /**
                     * Encodes the specified RestDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2.verify|verify} messages.
                     * @function encode
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.IRestDaoV2} message RestDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    RestDaoV2.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.minRest != null && Object.hasOwnProperty.call(message, "minRest"))
                            $root.google.protobuf.Duration.encode(message.minRest, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        if (message.maxRest != null && Object.hasOwnProperty.call(message, "maxRest"))
                            $root.google.protobuf.Duration.encode(message.maxRest, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                        if (message.failureRest != null && Object.hasOwnProperty.call(message, "failureRest"))
                            $root.google.protobuf.Duration.encode(message.failureRest, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified RestDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.IRestDaoV2} message RestDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    RestDaoV2.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a RestDaoV2 message from the specified reader or buffer.
                     * @function decode
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2} RestDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    RestDaoV2.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    message.minRest = $root.google.protobuf.Duration.decode(reader, reader.uint32());
                                    break;
                                }
                            case 2: {
                                    message.maxRest = $root.google.protobuf.Duration.decode(reader, reader.uint32());
                                    break;
                                }
                            case 3: {
                                    message.failureRest = $root.google.protobuf.Duration.decode(reader, reader.uint32());
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a RestDaoV2 message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2} RestDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    RestDaoV2.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a RestDaoV2 message.
                     * @function verify
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    RestDaoV2.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.minRest != null && message.hasOwnProperty("minRest")) {
                            let error = $root.google.protobuf.Duration.verify(message.minRest);
                            if (error)
                                return "minRest." + error;
                        }
                        if (message.maxRest != null && message.hasOwnProperty("maxRest")) {
                            let error = $root.google.protobuf.Duration.verify(message.maxRest);
                            if (error)
                                return "maxRest." + error;
                        }
                        if (message.failureRest != null && message.hasOwnProperty("failureRest")) {
                            let error = $root.google.protobuf.Duration.verify(message.failureRest);
                            if (error)
                                return "failureRest." + error;
                        }
                        return null;
                    };

                    /**
                     * Creates a RestDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2} RestDaoV2
                     */
                    RestDaoV2.fromObject = function fromObject(object) {
                        if (object instanceof $root.LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2)
                            return object;
                        let message = new $root.LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2();
                        if (object.minRest != null) {
                            if (typeof object.minRest !== "object")
                                throw TypeError(".LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2.minRest: object expected");
                            message.minRest = $root.google.protobuf.Duration.fromObject(object.minRest);
                        }
                        if (object.maxRest != null) {
                            if (typeof object.maxRest !== "object")
                                throw TypeError(".LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2.maxRest: object expected");
                            message.maxRest = $root.google.protobuf.Duration.fromObject(object.maxRest);
                        }
                        if (object.failureRest != null) {
                            if (typeof object.failureRest !== "object")
                                throw TypeError(".LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2.failureRest: object expected");
                            message.failureRest = $root.google.protobuf.Duration.fromObject(object.failureRest);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a RestDaoV2 message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2} message RestDaoV2
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    RestDaoV2.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            object.minRest = null;
                            object.maxRest = null;
                            object.failureRest = null;
                        }
                        if (message.minRest != null && message.hasOwnProperty("minRest"))
                            object.minRest = $root.google.protobuf.Duration.toObject(message.minRest, options);
                        if (message.maxRest != null && message.hasOwnProperty("maxRest"))
                            object.maxRest = $root.google.protobuf.Duration.toObject(message.maxRest, options);
                        if (message.failureRest != null && message.hasOwnProperty("failureRest"))
                            object.failureRest = $root.google.protobuf.Duration.toObject(message.failureRest, options);
                        return object;
                    };

                    /**
                     * Converts this RestDaoV2 to JSON.
                     * @function toJSON
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    RestDaoV2.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for RestDaoV2
                     * @function getTypeUrl
                     * @memberof LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    RestDaoV2.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2";
                    };

                    return RestDaoV2;
                })();

                return SessionBlueprintDao;
            })();

            Models.ExportedDataDao = (function() {

                /**
                 * Namespace ExportedDataDao.
                 * @memberof LiftLog.Ui.Models
                 * @namespace
                 */
                const ExportedDataDao = {};

                ExportedDataDao.ExportedDataDaoV2 = (function() {

                    /**
                     * Properties of an ExportedDataDaoV2.
                     * @memberof LiftLog.Ui.Models.ExportedDataDao
                     * @interface IExportedDataDaoV2
                     * @property {Array.<LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2>|null} [sessions] ExportedDataDaoV2 sessions
                     * @property {Array.<LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2>|null} [program] ExportedDataDaoV2 program
                     * @property {Object.<string,LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1>|null} [savedPrograms] ExportedDataDaoV2 savedPrograms
                     * @property {google.protobuf.IStringValue|null} [activeProgramId] ExportedDataDaoV2 activeProgramId
                     * @property {LiftLog.Ui.Models.IFeedStateDaoV1|null} [feedState] ExportedDataDaoV2 feedState
                     */

                    /**
                     * Constructs a new ExportedDataDaoV2.
                     * @memberof LiftLog.Ui.Models.ExportedDataDao
                     * @classdesc Represents an ExportedDataDaoV2.
                     * @implements IExportedDataDaoV2
                     * @constructor
                     * @param {LiftLog.Ui.Models.ExportedDataDao.IExportedDataDaoV2=} [properties] Properties to set
                     */
                    function ExportedDataDaoV2(properties) {
                        this.sessions = [];
                        this.program = [];
                        this.savedPrograms = {};
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * ExportedDataDaoV2 sessions.
                     * @member {Array.<LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2>} sessions
                     * @memberof LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2
                     * @instance
                     */
                    ExportedDataDaoV2.prototype.sessions = $util.emptyArray;

                    /**
                     * ExportedDataDaoV2 program.
                     * @member {Array.<LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2>} program
                     * @memberof LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2
                     * @instance
                     */
                    ExportedDataDaoV2.prototype.program = $util.emptyArray;

                    /**
                     * ExportedDataDaoV2 savedPrograms.
                     * @member {Object.<string,LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1>} savedPrograms
                     * @memberof LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2
                     * @instance
                     */
                    ExportedDataDaoV2.prototype.savedPrograms = $util.emptyObject;

                    /**
                     * ExportedDataDaoV2 activeProgramId.
                     * @member {google.protobuf.IStringValue|null|undefined} activeProgramId
                     * @memberof LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2
                     * @instance
                     */
                    ExportedDataDaoV2.prototype.activeProgramId = null;

                    /**
                     * ExportedDataDaoV2 feedState.
                     * @member {LiftLog.Ui.Models.IFeedStateDaoV1|null|undefined} feedState
                     * @memberof LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2
                     * @instance
                     */
                    ExportedDataDaoV2.prototype.feedState = null;

                    /**
                     * Creates a new ExportedDataDaoV2 instance using the specified properties.
                     * @function create
                     * @memberof LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.ExportedDataDao.IExportedDataDaoV2=} [properties] Properties to set
                     * @returns {LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2} ExportedDataDaoV2 instance
                     */
                    ExportedDataDaoV2.create = function create(properties) {
                        return new ExportedDataDaoV2(properties);
                    };

                    /**
                     * Encodes the specified ExportedDataDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2.verify|verify} messages.
                     * @function encode
                     * @memberof LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.ExportedDataDao.IExportedDataDaoV2} message ExportedDataDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ExportedDataDaoV2.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.sessions != null && message.sessions.length)
                            for (let i = 0; i < message.sessions.length; ++i)
                                $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.encode(message.sessions[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        if (message.program != null && message.program.length)
                            for (let i = 0; i < message.program.length; ++i)
                                $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.encode(message.program[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                        if (message.savedPrograms != null && Object.hasOwnProperty.call(message, "savedPrograms"))
                            for (let keys = Object.keys(message.savedPrograms), i = 0; i < keys.length; ++i) {
                                writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                                $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.encode(message.savedPrograms[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                            }
                        if (message.activeProgramId != null && Object.hasOwnProperty.call(message, "activeProgramId"))
                            $root.google.protobuf.StringValue.encode(message.activeProgramId, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                        if (message.feedState != null && Object.hasOwnProperty.call(message, "feedState"))
                            $root.LiftLog.Ui.Models.FeedStateDaoV1.encode(message.feedState, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified ExportedDataDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.ExportedDataDao.IExportedDataDaoV2} message ExportedDataDaoV2 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ExportedDataDaoV2.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes an ExportedDataDaoV2 message from the specified reader or buffer.
                     * @function decode
                     * @memberof LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2} ExportedDataDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ExportedDataDaoV2.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2(), key, value;
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    if (!(message.sessions && message.sessions.length))
                                        message.sessions = [];
                                    message.sessions.push($root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 2: {
                                    if (!(message.program && message.program.length))
                                        message.program = [];
                                    message.program.push($root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 3: {
                                    if (message.savedPrograms === $util.emptyObject)
                                        message.savedPrograms = {};
                                    let end2 = reader.uint32() + reader.pos;
                                    key = "";
                                    value = null;
                                    while (reader.pos < end2) {
                                        let tag2 = reader.uint32();
                                        switch (tag2 >>> 3) {
                                        case 1:
                                            key = reader.string();
                                            break;
                                        case 2:
                                            value = $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.decode(reader, reader.uint32());
                                            break;
                                        default:
                                            reader.skipType(tag2 & 7);
                                            break;
                                        }
                                    }
                                    message.savedPrograms[key] = value;
                                    break;
                                }
                            case 4: {
                                    message.activeProgramId = $root.google.protobuf.StringValue.decode(reader, reader.uint32());
                                    break;
                                }
                            case 5: {
                                    message.feedState = $root.LiftLog.Ui.Models.FeedStateDaoV1.decode(reader, reader.uint32());
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes an ExportedDataDaoV2 message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2} ExportedDataDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ExportedDataDaoV2.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an ExportedDataDaoV2 message.
                     * @function verify
                     * @memberof LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    ExportedDataDaoV2.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.sessions != null && message.hasOwnProperty("sessions")) {
                            if (!Array.isArray(message.sessions))
                                return "sessions: array expected";
                            for (let i = 0; i < message.sessions.length; ++i) {
                                let error = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.verify(message.sessions[i]);
                                if (error)
                                    return "sessions." + error;
                            }
                        }
                        if (message.program != null && message.hasOwnProperty("program")) {
                            if (!Array.isArray(message.program))
                                return "program: array expected";
                            for (let i = 0; i < message.program.length; ++i) {
                                let error = $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.verify(message.program[i]);
                                if (error)
                                    return "program." + error;
                            }
                        }
                        if (message.savedPrograms != null && message.hasOwnProperty("savedPrograms")) {
                            if (!$util.isObject(message.savedPrograms))
                                return "savedPrograms: object expected";
                            let key = Object.keys(message.savedPrograms);
                            for (let i = 0; i < key.length; ++i) {
                                let error = $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.verify(message.savedPrograms[key[i]]);
                                if (error)
                                    return "savedPrograms." + error;
                            }
                        }
                        if (message.activeProgramId != null && message.hasOwnProperty("activeProgramId")) {
                            let error = $root.google.protobuf.StringValue.verify(message.activeProgramId);
                            if (error)
                                return "activeProgramId." + error;
                        }
                        if (message.feedState != null && message.hasOwnProperty("feedState")) {
                            let error = $root.LiftLog.Ui.Models.FeedStateDaoV1.verify(message.feedState);
                            if (error)
                                return "feedState." + error;
                        }
                        return null;
                    };

                    /**
                     * Creates an ExportedDataDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2} ExportedDataDaoV2
                     */
                    ExportedDataDaoV2.fromObject = function fromObject(object) {
                        if (object instanceof $root.LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2)
                            return object;
                        let message = new $root.LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2();
                        if (object.sessions) {
                            if (!Array.isArray(object.sessions))
                                throw TypeError(".LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2.sessions: array expected");
                            message.sessions = [];
                            for (let i = 0; i < object.sessions.length; ++i) {
                                if (typeof object.sessions[i] !== "object")
                                    throw TypeError(".LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2.sessions: object expected");
                                message.sessions[i] = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.fromObject(object.sessions[i]);
                            }
                        }
                        if (object.program) {
                            if (!Array.isArray(object.program))
                                throw TypeError(".LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2.program: array expected");
                            message.program = [];
                            for (let i = 0; i < object.program.length; ++i) {
                                if (typeof object.program[i] !== "object")
                                    throw TypeError(".LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2.program: object expected");
                                message.program[i] = $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.fromObject(object.program[i]);
                            }
                        }
                        if (object.savedPrograms) {
                            if (typeof object.savedPrograms !== "object")
                                throw TypeError(".LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2.savedPrograms: object expected");
                            message.savedPrograms = {};
                            for (let keys = Object.keys(object.savedPrograms), i = 0; i < keys.length; ++i) {
                                if (typeof object.savedPrograms[keys[i]] !== "object")
                                    throw TypeError(".LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2.savedPrograms: object expected");
                                message.savedPrograms[keys[i]] = $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.fromObject(object.savedPrograms[keys[i]]);
                            }
                        }
                        if (object.activeProgramId != null) {
                            if (typeof object.activeProgramId !== "object")
                                throw TypeError(".LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2.activeProgramId: object expected");
                            message.activeProgramId = $root.google.protobuf.StringValue.fromObject(object.activeProgramId);
                        }
                        if (object.feedState != null) {
                            if (typeof object.feedState !== "object")
                                throw TypeError(".LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2.feedState: object expected");
                            message.feedState = $root.LiftLog.Ui.Models.FeedStateDaoV1.fromObject(object.feedState);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from an ExportedDataDaoV2 message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2
                     * @static
                     * @param {LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2} message ExportedDataDaoV2
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    ExportedDataDaoV2.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults) {
                            object.sessions = [];
                            object.program = [];
                        }
                        if (options.objects || options.defaults)
                            object.savedPrograms = {};
                        if (options.defaults) {
                            object.activeProgramId = null;
                            object.feedState = null;
                        }
                        if (message.sessions && message.sessions.length) {
                            object.sessions = [];
                            for (let j = 0; j < message.sessions.length; ++j)
                                object.sessions[j] = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.toObject(message.sessions[j], options);
                        }
                        if (message.program && message.program.length) {
                            object.program = [];
                            for (let j = 0; j < message.program.length; ++j)
                                object.program[j] = $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.toObject(message.program[j], options);
                        }
                        let keys2;
                        if (message.savedPrograms && (keys2 = Object.keys(message.savedPrograms)).length) {
                            object.savedPrograms = {};
                            for (let j = 0; j < keys2.length; ++j)
                                object.savedPrograms[keys2[j]] = $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.toObject(message.savedPrograms[keys2[j]], options);
                        }
                        if (message.activeProgramId != null && message.hasOwnProperty("activeProgramId"))
                            object.activeProgramId = $root.google.protobuf.StringValue.toObject(message.activeProgramId, options);
                        if (message.feedState != null && message.hasOwnProperty("feedState"))
                            object.feedState = $root.LiftLog.Ui.Models.FeedStateDaoV1.toObject(message.feedState, options);
                        return object;
                    };

                    /**
                     * Converts this ExportedDataDaoV2 to JSON.
                     * @function toJSON
                     * @memberof LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    ExportedDataDaoV2.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for ExportedDataDaoV2
                     * @function getTypeUrl
                     * @memberof LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    ExportedDataDaoV2.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2";
                    };

                    return ExportedDataDaoV2;
                })();

                return ExportedDataDao;
            })();

            Models.ProgramBlueprintDao = (function() {

                /**
                 * Namespace ProgramBlueprintDao.
                 * @memberof LiftLog.Ui.Models
                 * @namespace
                 */
                const ProgramBlueprintDao = {};

                ProgramBlueprintDao.ProgramBlueprintDaoContainerV1 = (function() {

                    /**
                     * Properties of a ProgramBlueprintDaoContainerV1.
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao
                     * @interface IProgramBlueprintDaoContainerV1
                     * @property {Object.<string,LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1>|null} [programBlueprints] ProgramBlueprintDaoContainerV1 programBlueprints
                     * @property {google.protobuf.IStringValue|null} [activeProgramId] ProgramBlueprintDaoContainerV1 activeProgramId
                     */

                    /**
                     * Constructs a new ProgramBlueprintDaoContainerV1.
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao
                     * @classdesc Represents a ProgramBlueprintDaoContainerV1.
                     * @implements IProgramBlueprintDaoContainerV1
                     * @constructor
                     * @param {LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoContainerV1=} [properties] Properties to set
                     */
                    function ProgramBlueprintDaoContainerV1(properties) {
                        this.programBlueprints = {};
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * ProgramBlueprintDaoContainerV1 programBlueprints.
                     * @member {Object.<string,LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1>} programBlueprints
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1
                     * @instance
                     */
                    ProgramBlueprintDaoContainerV1.prototype.programBlueprints = $util.emptyObject;

                    /**
                     * ProgramBlueprintDaoContainerV1 activeProgramId.
                     * @member {google.protobuf.IStringValue|null|undefined} activeProgramId
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1
                     * @instance
                     */
                    ProgramBlueprintDaoContainerV1.prototype.activeProgramId = null;

                    // OneOf field names bound to virtual getters and setters
                    let $oneOfFields;

                    /**
                     * ProgramBlueprintDaoContainerV1 _activeProgramId.
                     * @member {"activeProgramId"|undefined} _activeProgramId
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1
                     * @instance
                     */
                    Object.defineProperty(ProgramBlueprintDaoContainerV1.prototype, "_activeProgramId", {
                        get: $util.oneOfGetter($oneOfFields = ["activeProgramId"]),
                        set: $util.oneOfSetter($oneOfFields)
                    });

                    /**
                     * Creates a new ProgramBlueprintDaoContainerV1 instance using the specified properties.
                     * @function create
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1
                     * @static
                     * @param {LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoContainerV1=} [properties] Properties to set
                     * @returns {LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1} ProgramBlueprintDaoContainerV1 instance
                     */
                    ProgramBlueprintDaoContainerV1.create = function create(properties) {
                        return new ProgramBlueprintDaoContainerV1(properties);
                    };

                    /**
                     * Encodes the specified ProgramBlueprintDaoContainerV1 message. Does not implicitly {@link LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1.verify|verify} messages.
                     * @function encode
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1
                     * @static
                     * @param {LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoContainerV1} message ProgramBlueprintDaoContainerV1 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ProgramBlueprintDaoContainerV1.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.programBlueprints != null && Object.hasOwnProperty.call(message, "programBlueprints"))
                            for (let keys = Object.keys(message.programBlueprints), i = 0; i < keys.length; ++i) {
                                writer.uint32(/* id 1, wireType 2 =*/10).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                                $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.encode(message.programBlueprints[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                            }
                        if (message.activeProgramId != null && Object.hasOwnProperty.call(message, "activeProgramId"))
                            $root.google.protobuf.StringValue.encode(message.activeProgramId, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified ProgramBlueprintDaoContainerV1 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1
                     * @static
                     * @param {LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoContainerV1} message ProgramBlueprintDaoContainerV1 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ProgramBlueprintDaoContainerV1.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a ProgramBlueprintDaoContainerV1 message from the specified reader or buffer.
                     * @function decode
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1} ProgramBlueprintDaoContainerV1
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ProgramBlueprintDaoContainerV1.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1(), key, value;
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    if (message.programBlueprints === $util.emptyObject)
                                        message.programBlueprints = {};
                                    let end2 = reader.uint32() + reader.pos;
                                    key = "";
                                    value = null;
                                    while (reader.pos < end2) {
                                        let tag2 = reader.uint32();
                                        switch (tag2 >>> 3) {
                                        case 1:
                                            key = reader.string();
                                            break;
                                        case 2:
                                            value = $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.decode(reader, reader.uint32());
                                            break;
                                        default:
                                            reader.skipType(tag2 & 7);
                                            break;
                                        }
                                    }
                                    message.programBlueprints[key] = value;
                                    break;
                                }
                            case 2: {
                                    message.activeProgramId = $root.google.protobuf.StringValue.decode(reader, reader.uint32());
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a ProgramBlueprintDaoContainerV1 message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1} ProgramBlueprintDaoContainerV1
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ProgramBlueprintDaoContainerV1.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a ProgramBlueprintDaoContainerV1 message.
                     * @function verify
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    ProgramBlueprintDaoContainerV1.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        let properties = {};
                        if (message.programBlueprints != null && message.hasOwnProperty("programBlueprints")) {
                            if (!$util.isObject(message.programBlueprints))
                                return "programBlueprints: object expected";
                            let key = Object.keys(message.programBlueprints);
                            for (let i = 0; i < key.length; ++i) {
                                let error = $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.verify(message.programBlueprints[key[i]]);
                                if (error)
                                    return "programBlueprints." + error;
                            }
                        }
                        if (message.activeProgramId != null && message.hasOwnProperty("activeProgramId")) {
                            properties._activeProgramId = 1;
                            {
                                let error = $root.google.protobuf.StringValue.verify(message.activeProgramId);
                                if (error)
                                    return "activeProgramId." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a ProgramBlueprintDaoContainerV1 message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1} ProgramBlueprintDaoContainerV1
                     */
                    ProgramBlueprintDaoContainerV1.fromObject = function fromObject(object) {
                        if (object instanceof $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1)
                            return object;
                        let message = new $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1();
                        if (object.programBlueprints) {
                            if (typeof object.programBlueprints !== "object")
                                throw TypeError(".LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1.programBlueprints: object expected");
                            message.programBlueprints = {};
                            for (let keys = Object.keys(object.programBlueprints), i = 0; i < keys.length; ++i) {
                                if (typeof object.programBlueprints[keys[i]] !== "object")
                                    throw TypeError(".LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1.programBlueprints: object expected");
                                message.programBlueprints[keys[i]] = $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.fromObject(object.programBlueprints[keys[i]]);
                            }
                        }
                        if (object.activeProgramId != null) {
                            if (typeof object.activeProgramId !== "object")
                                throw TypeError(".LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1.activeProgramId: object expected");
                            message.activeProgramId = $root.google.protobuf.StringValue.fromObject(object.activeProgramId);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a ProgramBlueprintDaoContainerV1 message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1
                     * @static
                     * @param {LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1} message ProgramBlueprintDaoContainerV1
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    ProgramBlueprintDaoContainerV1.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.objects || options.defaults)
                            object.programBlueprints = {};
                        let keys2;
                        if (message.programBlueprints && (keys2 = Object.keys(message.programBlueprints)).length) {
                            object.programBlueprints = {};
                            for (let j = 0; j < keys2.length; ++j)
                                object.programBlueprints[keys2[j]] = $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.toObject(message.programBlueprints[keys2[j]], options);
                        }
                        if (message.activeProgramId != null && message.hasOwnProperty("activeProgramId")) {
                            object.activeProgramId = $root.google.protobuf.StringValue.toObject(message.activeProgramId, options);
                            if (options.oneofs)
                                object._activeProgramId = "activeProgramId";
                        }
                        return object;
                    };

                    /**
                     * Converts this ProgramBlueprintDaoContainerV1 to JSON.
                     * @function toJSON
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    ProgramBlueprintDaoContainerV1.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for ProgramBlueprintDaoContainerV1
                     * @function getTypeUrl
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    ProgramBlueprintDaoContainerV1.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1";
                    };

                    return ProgramBlueprintDaoContainerV1;
                })();

                ProgramBlueprintDao.ProgramBlueprintDaoV1 = (function() {

                    /**
                     * Properties of a ProgramBlueprintDaoV1.
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao
                     * @interface IProgramBlueprintDaoV1
                     * @property {string|null} [name] ProgramBlueprintDaoV1 name
                     * @property {Array.<LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2>|null} [sessions] ProgramBlueprintDaoV1 sessions
                     * @property {LiftLog.Ui.Models.IDateOnlyDao|null} [lastEdited] ProgramBlueprintDaoV1 lastEdited
                     */

                    /**
                     * Constructs a new ProgramBlueprintDaoV1.
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao
                     * @classdesc Represents a ProgramBlueprintDaoV1.
                     * @implements IProgramBlueprintDaoV1
                     * @constructor
                     * @param {LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1=} [properties] Properties to set
                     */
                    function ProgramBlueprintDaoV1(properties) {
                        this.sessions = [];
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * ProgramBlueprintDaoV1 name.
                     * @member {string} name
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1
                     * @instance
                     */
                    ProgramBlueprintDaoV1.prototype.name = "";

                    /**
                     * ProgramBlueprintDaoV1 sessions.
                     * @member {Array.<LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2>} sessions
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1
                     * @instance
                     */
                    ProgramBlueprintDaoV1.prototype.sessions = $util.emptyArray;

                    /**
                     * ProgramBlueprintDaoV1 lastEdited.
                     * @member {LiftLog.Ui.Models.IDateOnlyDao|null|undefined} lastEdited
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1
                     * @instance
                     */
                    ProgramBlueprintDaoV1.prototype.lastEdited = null;

                    // OneOf field names bound to virtual getters and setters
                    let $oneOfFields;

                    /**
                     * ProgramBlueprintDaoV1 _lastEdited.
                     * @member {"lastEdited"|undefined} _lastEdited
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1
                     * @instance
                     */
                    Object.defineProperty(ProgramBlueprintDaoV1.prototype, "_lastEdited", {
                        get: $util.oneOfGetter($oneOfFields = ["lastEdited"]),
                        set: $util.oneOfSetter($oneOfFields)
                    });

                    /**
                     * Creates a new ProgramBlueprintDaoV1 instance using the specified properties.
                     * @function create
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1
                     * @static
                     * @param {LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1=} [properties] Properties to set
                     * @returns {LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1} ProgramBlueprintDaoV1 instance
                     */
                    ProgramBlueprintDaoV1.create = function create(properties) {
                        return new ProgramBlueprintDaoV1(properties);
                    };

                    /**
                     * Encodes the specified ProgramBlueprintDaoV1 message. Does not implicitly {@link LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.verify|verify} messages.
                     * @function encode
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1
                     * @static
                     * @param {LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1} message ProgramBlueprintDaoV1 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ProgramBlueprintDaoV1.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                        if (message.sessions != null && message.sessions.length)
                            for (let i = 0; i < message.sessions.length; ++i)
                                $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.encode(message.sessions[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                        if (message.lastEdited != null && Object.hasOwnProperty.call(message, "lastEdited"))
                            $root.LiftLog.Ui.Models.DateOnlyDao.encode(message.lastEdited, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified ProgramBlueprintDaoV1 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1
                     * @static
                     * @param {LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1} message ProgramBlueprintDaoV1 message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ProgramBlueprintDaoV1.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a ProgramBlueprintDaoV1 message from the specified reader or buffer.
                     * @function decode
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1} ProgramBlueprintDaoV1
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ProgramBlueprintDaoV1.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    message.name = reader.string();
                                    break;
                                }
                            case 5: {
                                    if (!(message.sessions && message.sessions.length))
                                        message.sessions = [];
                                    message.sessions.push($root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 6: {
                                    message.lastEdited = $root.LiftLog.Ui.Models.DateOnlyDao.decode(reader, reader.uint32());
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a ProgramBlueprintDaoV1 message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1} ProgramBlueprintDaoV1
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ProgramBlueprintDaoV1.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a ProgramBlueprintDaoV1 message.
                     * @function verify
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    ProgramBlueprintDaoV1.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        let properties = {};
                        if (message.name != null && message.hasOwnProperty("name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.sessions != null && message.hasOwnProperty("sessions")) {
                            if (!Array.isArray(message.sessions))
                                return "sessions: array expected";
                            for (let i = 0; i < message.sessions.length; ++i) {
                                let error = $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.verify(message.sessions[i]);
                                if (error)
                                    return "sessions." + error;
                            }
                        }
                        if (message.lastEdited != null && message.hasOwnProperty("lastEdited")) {
                            properties._lastEdited = 1;
                            {
                                let error = $root.LiftLog.Ui.Models.DateOnlyDao.verify(message.lastEdited);
                                if (error)
                                    return "lastEdited." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a ProgramBlueprintDaoV1 message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1} ProgramBlueprintDaoV1
                     */
                    ProgramBlueprintDaoV1.fromObject = function fromObject(object) {
                        if (object instanceof $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1)
                            return object;
                        let message = new $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1();
                        if (object.name != null)
                            message.name = String(object.name);
                        if (object.sessions) {
                            if (!Array.isArray(object.sessions))
                                throw TypeError(".LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.sessions: array expected");
                            message.sessions = [];
                            for (let i = 0; i < object.sessions.length; ++i) {
                                if (typeof object.sessions[i] !== "object")
                                    throw TypeError(".LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.sessions: object expected");
                                message.sessions[i] = $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.fromObject(object.sessions[i]);
                            }
                        }
                        if (object.lastEdited != null) {
                            if (typeof object.lastEdited !== "object")
                                throw TypeError(".LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.lastEdited: object expected");
                            message.lastEdited = $root.LiftLog.Ui.Models.DateOnlyDao.fromObject(object.lastEdited);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a ProgramBlueprintDaoV1 message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1
                     * @static
                     * @param {LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1} message ProgramBlueprintDaoV1
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    ProgramBlueprintDaoV1.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.sessions = [];
                        if (options.defaults)
                            object.name = "";
                        if (message.name != null && message.hasOwnProperty("name"))
                            object.name = message.name;
                        if (message.sessions && message.sessions.length) {
                            object.sessions = [];
                            for (let j = 0; j < message.sessions.length; ++j)
                                object.sessions[j] = $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.toObject(message.sessions[j], options);
                        }
                        if (message.lastEdited != null && message.hasOwnProperty("lastEdited")) {
                            object.lastEdited = $root.LiftLog.Ui.Models.DateOnlyDao.toObject(message.lastEdited, options);
                            if (options.oneofs)
                                object._lastEdited = "lastEdited";
                        }
                        return object;
                    };

                    /**
                     * Converts this ProgramBlueprintDaoV1 to JSON.
                     * @function toJSON
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    ProgramBlueprintDaoV1.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for ProgramBlueprintDaoV1
                     * @function getTypeUrl
                     * @memberof LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    ProgramBlueprintDaoV1.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1";
                    };

                    return ProgramBlueprintDaoV1;
                })();

                return ProgramBlueprintDao;
            })();

            Models.FeedIdentityDaoV1 = (function() {

                /**
                 * Properties of a FeedIdentityDaoV1.
                 * @memberof LiftLog.Ui.Models
                 * @interface IFeedIdentityDaoV1
                 * @property {LiftLog.Ui.Models.IUuidDao|null} [id] FeedIdentityDaoV1 id
                 * @property {google.protobuf.IStringValue|null} [lookup] FeedIdentityDaoV1 lookup
                 * @property {Uint8Array|null} [aesKey] FeedIdentityDaoV1 aesKey
                 * @property {Uint8Array|null} [publicKey] FeedIdentityDaoV1 publicKey
                 * @property {Uint8Array|null} [privateKey] FeedIdentityDaoV1 privateKey
                 * @property {string|null} [password] FeedIdentityDaoV1 password
                 * @property {google.protobuf.IStringValue|null} [name] FeedIdentityDaoV1 name
                 * @property {Uint8Array|null} [profilePicture] FeedIdentityDaoV1 profilePicture
                 * @property {boolean|null} [publishBodyweight] FeedIdentityDaoV1 publishBodyweight
                 * @property {boolean|null} [publishPlan] FeedIdentityDaoV1 publishPlan
                 * @property {boolean|null} [publishWorkouts] FeedIdentityDaoV1 publishWorkouts
                 */

                /**
                 * Constructs a new FeedIdentityDaoV1.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents a FeedIdentityDaoV1.
                 * @implements IFeedIdentityDaoV1
                 * @constructor
                 * @param {LiftLog.Ui.Models.IFeedIdentityDaoV1=} [properties] Properties to set
                 */
                function FeedIdentityDaoV1(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * FeedIdentityDaoV1 id.
                 * @member {LiftLog.Ui.Models.IUuidDao|null|undefined} id
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @instance
                 */
                FeedIdentityDaoV1.prototype.id = null;

                /**
                 * FeedIdentityDaoV1 lookup.
                 * @member {google.protobuf.IStringValue|null|undefined} lookup
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @instance
                 */
                FeedIdentityDaoV1.prototype.lookup = null;

                /**
                 * FeedIdentityDaoV1 aesKey.
                 * @member {Uint8Array} aesKey
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @instance
                 */
                FeedIdentityDaoV1.prototype.aesKey = $util.newBuffer([]);

                /**
                 * FeedIdentityDaoV1 publicKey.
                 * @member {Uint8Array} publicKey
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @instance
                 */
                FeedIdentityDaoV1.prototype.publicKey = $util.newBuffer([]);

                /**
                 * FeedIdentityDaoV1 privateKey.
                 * @member {Uint8Array} privateKey
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @instance
                 */
                FeedIdentityDaoV1.prototype.privateKey = $util.newBuffer([]);

                /**
                 * FeedIdentityDaoV1 password.
                 * @member {string} password
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @instance
                 */
                FeedIdentityDaoV1.prototype.password = "";

                /**
                 * FeedIdentityDaoV1 name.
                 * @member {google.protobuf.IStringValue|null|undefined} name
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @instance
                 */
                FeedIdentityDaoV1.prototype.name = null;

                /**
                 * FeedIdentityDaoV1 profilePicture.
                 * @member {Uint8Array|null|undefined} profilePicture
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @instance
                 */
                FeedIdentityDaoV1.prototype.profilePicture = null;

                /**
                 * FeedIdentityDaoV1 publishBodyweight.
                 * @member {boolean} publishBodyweight
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @instance
                 */
                FeedIdentityDaoV1.prototype.publishBodyweight = false;

                /**
                 * FeedIdentityDaoV1 publishPlan.
                 * @member {boolean} publishPlan
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @instance
                 */
                FeedIdentityDaoV1.prototype.publishPlan = false;

                /**
                 * FeedIdentityDaoV1 publishWorkouts.
                 * @member {boolean} publishWorkouts
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @instance
                 */
                FeedIdentityDaoV1.prototype.publishWorkouts = false;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * FeedIdentityDaoV1 _name.
                 * @member {"name"|undefined} _name
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @instance
                 */
                Object.defineProperty(FeedIdentityDaoV1.prototype, "_name", {
                    get: $util.oneOfGetter($oneOfFields = ["name"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * FeedIdentityDaoV1 _profilePicture.
                 * @member {"profilePicture"|undefined} _profilePicture
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @instance
                 */
                Object.defineProperty(FeedIdentityDaoV1.prototype, "_profilePicture", {
                    get: $util.oneOfGetter($oneOfFields = ["profilePicture"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new FeedIdentityDaoV1 instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.IFeedIdentityDaoV1=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.FeedIdentityDaoV1} FeedIdentityDaoV1 instance
                 */
                FeedIdentityDaoV1.create = function create(properties) {
                    return new FeedIdentityDaoV1(properties);
                };

                /**
                 * Encodes the specified FeedIdentityDaoV1 message. Does not implicitly {@link LiftLog.Ui.Models.FeedIdentityDaoV1.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.IFeedIdentityDaoV1} message FeedIdentityDaoV1 message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FeedIdentityDaoV1.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                        $root.LiftLog.Ui.Models.UuidDao.encode(message.id, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.aesKey != null && Object.hasOwnProperty.call(message, "aesKey"))
                        writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.aesKey);
                    if (message.password != null && Object.hasOwnProperty.call(message, "password"))
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.password);
                    if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                        $root.google.protobuf.StringValue.encode(message.name, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                    if (message.profilePicture != null && Object.hasOwnProperty.call(message, "profilePicture"))
                        writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.profilePicture);
                    if (message.publishBodyweight != null && Object.hasOwnProperty.call(message, "publishBodyweight"))
                        writer.uint32(/* id 7, wireType 0 =*/56).bool(message.publishBodyweight);
                    if (message.publishPlan != null && Object.hasOwnProperty.call(message, "publishPlan"))
                        writer.uint32(/* id 8, wireType 0 =*/64).bool(message.publishPlan);
                    if (message.publicKey != null && Object.hasOwnProperty.call(message, "publicKey"))
                        writer.uint32(/* id 9, wireType 2 =*/74).bytes(message.publicKey);
                    if (message.privateKey != null && Object.hasOwnProperty.call(message, "privateKey"))
                        writer.uint32(/* id 10, wireType 2 =*/82).bytes(message.privateKey);
                    if (message.publishWorkouts != null && Object.hasOwnProperty.call(message, "publishWorkouts"))
                        writer.uint32(/* id 11, wireType 0 =*/88).bool(message.publishWorkouts);
                    if (message.lookup != null && Object.hasOwnProperty.call(message, "lookup"))
                        $root.google.protobuf.StringValue.encode(message.lookup, writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified FeedIdentityDaoV1 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.FeedIdentityDaoV1.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.IFeedIdentityDaoV1} message FeedIdentityDaoV1 message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FeedIdentityDaoV1.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a FeedIdentityDaoV1 message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.FeedIdentityDaoV1} FeedIdentityDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FeedIdentityDaoV1.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.FeedIdentityDaoV1();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.id = $root.LiftLog.Ui.Models.UuidDao.decode(reader, reader.uint32());
                                break;
                            }
                        case 12: {
                                message.lookup = $root.google.protobuf.StringValue.decode(reader, reader.uint32());
                                break;
                            }
                        case 2: {
                                message.aesKey = reader.bytes();
                                break;
                            }
                        case 9: {
                                message.publicKey = reader.bytes();
                                break;
                            }
                        case 10: {
                                message.privateKey = reader.bytes();
                                break;
                            }
                        case 4: {
                                message.password = reader.string();
                                break;
                            }
                        case 5: {
                                message.name = $root.google.protobuf.StringValue.decode(reader, reader.uint32());
                                break;
                            }
                        case 6: {
                                message.profilePicture = reader.bytes();
                                break;
                            }
                        case 7: {
                                message.publishBodyweight = reader.bool();
                                break;
                            }
                        case 8: {
                                message.publishPlan = reader.bool();
                                break;
                            }
                        case 11: {
                                message.publishWorkouts = reader.bool();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a FeedIdentityDaoV1 message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.FeedIdentityDaoV1} FeedIdentityDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FeedIdentityDaoV1.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a FeedIdentityDaoV1 message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                FeedIdentityDaoV1.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    let properties = {};
                    if (message.id != null && message.hasOwnProperty("id")) {
                        let error = $root.LiftLog.Ui.Models.UuidDao.verify(message.id);
                        if (error)
                            return "id." + error;
                    }
                    if (message.lookup != null && message.hasOwnProperty("lookup")) {
                        let error = $root.google.protobuf.StringValue.verify(message.lookup);
                        if (error)
                            return "lookup." + error;
                    }
                    if (message.aesKey != null && message.hasOwnProperty("aesKey"))
                        if (!(message.aesKey && typeof message.aesKey.length === "number" || $util.isString(message.aesKey)))
                            return "aesKey: buffer expected";
                    if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                        if (!(message.publicKey && typeof message.publicKey.length === "number" || $util.isString(message.publicKey)))
                            return "publicKey: buffer expected";
                    if (message.privateKey != null && message.hasOwnProperty("privateKey"))
                        if (!(message.privateKey && typeof message.privateKey.length === "number" || $util.isString(message.privateKey)))
                            return "privateKey: buffer expected";
                    if (message.password != null && message.hasOwnProperty("password"))
                        if (!$util.isString(message.password))
                            return "password: string expected";
                    if (message.name != null && message.hasOwnProperty("name")) {
                        properties._name = 1;
                        {
                            let error = $root.google.protobuf.StringValue.verify(message.name);
                            if (error)
                                return "name." + error;
                        }
                    }
                    if (message.profilePicture != null && message.hasOwnProperty("profilePicture")) {
                        properties._profilePicture = 1;
                        if (!(message.profilePicture && typeof message.profilePicture.length === "number" || $util.isString(message.profilePicture)))
                            return "profilePicture: buffer expected";
                    }
                    if (message.publishBodyweight != null && message.hasOwnProperty("publishBodyweight"))
                        if (typeof message.publishBodyweight !== "boolean")
                            return "publishBodyweight: boolean expected";
                    if (message.publishPlan != null && message.hasOwnProperty("publishPlan"))
                        if (typeof message.publishPlan !== "boolean")
                            return "publishPlan: boolean expected";
                    if (message.publishWorkouts != null && message.hasOwnProperty("publishWorkouts"))
                        if (typeof message.publishWorkouts !== "boolean")
                            return "publishWorkouts: boolean expected";
                    return null;
                };

                /**
                 * Creates a FeedIdentityDaoV1 message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.FeedIdentityDaoV1} FeedIdentityDaoV1
                 */
                FeedIdentityDaoV1.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.FeedIdentityDaoV1)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.FeedIdentityDaoV1();
                    if (object.id != null) {
                        if (typeof object.id !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FeedIdentityDaoV1.id: object expected");
                        message.id = $root.LiftLog.Ui.Models.UuidDao.fromObject(object.id);
                    }
                    if (object.lookup != null) {
                        if (typeof object.lookup !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FeedIdentityDaoV1.lookup: object expected");
                        message.lookup = $root.google.protobuf.StringValue.fromObject(object.lookup);
                    }
                    if (object.aesKey != null)
                        if (typeof object.aesKey === "string")
                            $util.base64.decode(object.aesKey, message.aesKey = $util.newBuffer($util.base64.length(object.aesKey)), 0);
                        else if (object.aesKey.length >= 0)
                            message.aesKey = object.aesKey;
                    if (object.publicKey != null)
                        if (typeof object.publicKey === "string")
                            $util.base64.decode(object.publicKey, message.publicKey = $util.newBuffer($util.base64.length(object.publicKey)), 0);
                        else if (object.publicKey.length >= 0)
                            message.publicKey = object.publicKey;
                    if (object.privateKey != null)
                        if (typeof object.privateKey === "string")
                            $util.base64.decode(object.privateKey, message.privateKey = $util.newBuffer($util.base64.length(object.privateKey)), 0);
                        else if (object.privateKey.length >= 0)
                            message.privateKey = object.privateKey;
                    if (object.password != null)
                        message.password = String(object.password);
                    if (object.name != null) {
                        if (typeof object.name !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FeedIdentityDaoV1.name: object expected");
                        message.name = $root.google.protobuf.StringValue.fromObject(object.name);
                    }
                    if (object.profilePicture != null)
                        if (typeof object.profilePicture === "string")
                            $util.base64.decode(object.profilePicture, message.profilePicture = $util.newBuffer($util.base64.length(object.profilePicture)), 0);
                        else if (object.profilePicture.length >= 0)
                            message.profilePicture = object.profilePicture;
                    if (object.publishBodyweight != null)
                        message.publishBodyweight = Boolean(object.publishBodyweight);
                    if (object.publishPlan != null)
                        message.publishPlan = Boolean(object.publishPlan);
                    if (object.publishWorkouts != null)
                        message.publishWorkouts = Boolean(object.publishWorkouts);
                    return message;
                };

                /**
                 * Creates a plain object from a FeedIdentityDaoV1 message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.FeedIdentityDaoV1} message FeedIdentityDaoV1
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                FeedIdentityDaoV1.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.id = null;
                        if (options.bytes === String)
                            object.aesKey = "";
                        else {
                            object.aesKey = [];
                            if (options.bytes !== Array)
                                object.aesKey = $util.newBuffer(object.aesKey);
                        }
                        object.password = "";
                        object.publishBodyweight = false;
                        object.publishPlan = false;
                        if (options.bytes === String)
                            object.publicKey = "";
                        else {
                            object.publicKey = [];
                            if (options.bytes !== Array)
                                object.publicKey = $util.newBuffer(object.publicKey);
                        }
                        if (options.bytes === String)
                            object.privateKey = "";
                        else {
                            object.privateKey = [];
                            if (options.bytes !== Array)
                                object.privateKey = $util.newBuffer(object.privateKey);
                        }
                        object.publishWorkouts = false;
                        object.lookup = null;
                    }
                    if (message.id != null && message.hasOwnProperty("id"))
                        object.id = $root.LiftLog.Ui.Models.UuidDao.toObject(message.id, options);
                    if (message.aesKey != null && message.hasOwnProperty("aesKey"))
                        object.aesKey = options.bytes === String ? $util.base64.encode(message.aesKey, 0, message.aesKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.aesKey) : message.aesKey;
                    if (message.password != null && message.hasOwnProperty("password"))
                        object.password = message.password;
                    if (message.name != null && message.hasOwnProperty("name")) {
                        object.name = $root.google.protobuf.StringValue.toObject(message.name, options);
                        if (options.oneofs)
                            object._name = "name";
                    }
                    if (message.profilePicture != null && message.hasOwnProperty("profilePicture")) {
                        object.profilePicture = options.bytes === String ? $util.base64.encode(message.profilePicture, 0, message.profilePicture.length) : options.bytes === Array ? Array.prototype.slice.call(message.profilePicture) : message.profilePicture;
                        if (options.oneofs)
                            object._profilePicture = "profilePicture";
                    }
                    if (message.publishBodyweight != null && message.hasOwnProperty("publishBodyweight"))
                        object.publishBodyweight = message.publishBodyweight;
                    if (message.publishPlan != null && message.hasOwnProperty("publishPlan"))
                        object.publishPlan = message.publishPlan;
                    if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                        object.publicKey = options.bytes === String ? $util.base64.encode(message.publicKey, 0, message.publicKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.publicKey) : message.publicKey;
                    if (message.privateKey != null && message.hasOwnProperty("privateKey"))
                        object.privateKey = options.bytes === String ? $util.base64.encode(message.privateKey, 0, message.privateKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.privateKey) : message.privateKey;
                    if (message.publishWorkouts != null && message.hasOwnProperty("publishWorkouts"))
                        object.publishWorkouts = message.publishWorkouts;
                    if (message.lookup != null && message.hasOwnProperty("lookup"))
                        object.lookup = $root.google.protobuf.StringValue.toObject(message.lookup, options);
                    return object;
                };

                /**
                 * Converts this FeedIdentityDaoV1 to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                FeedIdentityDaoV1.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for FeedIdentityDaoV1
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.FeedIdentityDaoV1
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                FeedIdentityDaoV1.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.FeedIdentityDaoV1";
                };

                return FeedIdentityDaoV1;
            })();

            Models.FeedUserDaoV1 = (function() {

                /**
                 * Properties of a FeedUserDaoV1.
                 * @memberof LiftLog.Ui.Models
                 * @interface IFeedUserDaoV1
                 * @property {LiftLog.Ui.Models.IUuidDao|null} [id] FeedUserDaoV1 id
                 * @property {google.protobuf.IStringValue|null} [lookup] FeedUserDaoV1 lookup
                 * @property {Uint8Array|null} [publicKey] FeedUserDaoV1 publicKey
                 * @property {google.protobuf.IStringValue|null} [name] FeedUserDaoV1 name
                 * @property {google.protobuf.IStringValue|null} [nickname] FeedUserDaoV1 nickname
                 * @property {LiftLog.Ui.Models.ICurrentPlanDaoV1|null} [currentPlan] FeedUserDaoV1 currentPlan
                 * @property {Uint8Array|null} [profilePicture] FeedUserDaoV1 profilePicture
                 * @property {Uint8Array|null} [aesKey] FeedUserDaoV1 aesKey
                 * @property {google.protobuf.IStringValue|null} [followSecret] FeedUserDaoV1 followSecret
                 */

                /**
                 * Constructs a new FeedUserDaoV1.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents a FeedUserDaoV1.
                 * @implements IFeedUserDaoV1
                 * @constructor
                 * @param {LiftLog.Ui.Models.IFeedUserDaoV1=} [properties] Properties to set
                 */
                function FeedUserDaoV1(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * FeedUserDaoV1 id.
                 * @member {LiftLog.Ui.Models.IUuidDao|null|undefined} id
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @instance
                 */
                FeedUserDaoV1.prototype.id = null;

                /**
                 * FeedUserDaoV1 lookup.
                 * @member {google.protobuf.IStringValue|null|undefined} lookup
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @instance
                 */
                FeedUserDaoV1.prototype.lookup = null;

                /**
                 * FeedUserDaoV1 publicKey.
                 * @member {Uint8Array} publicKey
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @instance
                 */
                FeedUserDaoV1.prototype.publicKey = $util.newBuffer([]);

                /**
                 * FeedUserDaoV1 name.
                 * @member {google.protobuf.IStringValue|null|undefined} name
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @instance
                 */
                FeedUserDaoV1.prototype.name = null;

                /**
                 * FeedUserDaoV1 nickname.
                 * @member {google.protobuf.IStringValue|null|undefined} nickname
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @instance
                 */
                FeedUserDaoV1.prototype.nickname = null;

                /**
                 * FeedUserDaoV1 currentPlan.
                 * @member {LiftLog.Ui.Models.ICurrentPlanDaoV1|null|undefined} currentPlan
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @instance
                 */
                FeedUserDaoV1.prototype.currentPlan = null;

                /**
                 * FeedUserDaoV1 profilePicture.
                 * @member {Uint8Array|null|undefined} profilePicture
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @instance
                 */
                FeedUserDaoV1.prototype.profilePicture = null;

                /**
                 * FeedUserDaoV1 aesKey.
                 * @member {Uint8Array|null|undefined} aesKey
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @instance
                 */
                FeedUserDaoV1.prototype.aesKey = null;

                /**
                 * FeedUserDaoV1 followSecret.
                 * @member {google.protobuf.IStringValue|null|undefined} followSecret
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @instance
                 */
                FeedUserDaoV1.prototype.followSecret = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * FeedUserDaoV1 _name.
                 * @member {"name"|undefined} _name
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @instance
                 */
                Object.defineProperty(FeedUserDaoV1.prototype, "_name", {
                    get: $util.oneOfGetter($oneOfFields = ["name"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * FeedUserDaoV1 _nickname.
                 * @member {"nickname"|undefined} _nickname
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @instance
                 */
                Object.defineProperty(FeedUserDaoV1.prototype, "_nickname", {
                    get: $util.oneOfGetter($oneOfFields = ["nickname"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * FeedUserDaoV1 _currentPlan.
                 * @member {"currentPlan"|undefined} _currentPlan
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @instance
                 */
                Object.defineProperty(FeedUserDaoV1.prototype, "_currentPlan", {
                    get: $util.oneOfGetter($oneOfFields = ["currentPlan"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * FeedUserDaoV1 _profilePicture.
                 * @member {"profilePicture"|undefined} _profilePicture
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @instance
                 */
                Object.defineProperty(FeedUserDaoV1.prototype, "_profilePicture", {
                    get: $util.oneOfGetter($oneOfFields = ["profilePicture"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * FeedUserDaoV1 _aesKey.
                 * @member {"aesKey"|undefined} _aesKey
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @instance
                 */
                Object.defineProperty(FeedUserDaoV1.prototype, "_aesKey", {
                    get: $util.oneOfGetter($oneOfFields = ["aesKey"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * FeedUserDaoV1 _followSecret.
                 * @member {"followSecret"|undefined} _followSecret
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @instance
                 */
                Object.defineProperty(FeedUserDaoV1.prototype, "_followSecret", {
                    get: $util.oneOfGetter($oneOfFields = ["followSecret"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new FeedUserDaoV1 instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.IFeedUserDaoV1=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.FeedUserDaoV1} FeedUserDaoV1 instance
                 */
                FeedUserDaoV1.create = function create(properties) {
                    return new FeedUserDaoV1(properties);
                };

                /**
                 * Encodes the specified FeedUserDaoV1 message. Does not implicitly {@link LiftLog.Ui.Models.FeedUserDaoV1.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.IFeedUserDaoV1} message FeedUserDaoV1 message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FeedUserDaoV1.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                        $root.LiftLog.Ui.Models.UuidDao.encode(message.id, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                        $root.google.protobuf.StringValue.encode(message.name, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.currentPlan != null && Object.hasOwnProperty.call(message, "currentPlan"))
                        $root.LiftLog.Ui.Models.CurrentPlanDaoV1.encode(message.currentPlan, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    if (message.profilePicture != null && Object.hasOwnProperty.call(message, "profilePicture"))
                        writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.profilePicture);
                    if (message.aesKey != null && Object.hasOwnProperty.call(message, "aesKey"))
                        writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.aesKey);
                    if (message.nickname != null && Object.hasOwnProperty.call(message, "nickname"))
                        $root.google.protobuf.StringValue.encode(message.nickname, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                    if (message.followSecret != null && Object.hasOwnProperty.call(message, "followSecret"))
                        $root.google.protobuf.StringValue.encode(message.followSecret, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                    if (message.publicKey != null && Object.hasOwnProperty.call(message, "publicKey"))
                        writer.uint32(/* id 8, wireType 2 =*/66).bytes(message.publicKey);
                    if (message.lookup != null && Object.hasOwnProperty.call(message, "lookup"))
                        $root.google.protobuf.StringValue.encode(message.lookup, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified FeedUserDaoV1 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.FeedUserDaoV1.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.IFeedUserDaoV1} message FeedUserDaoV1 message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FeedUserDaoV1.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a FeedUserDaoV1 message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.FeedUserDaoV1} FeedUserDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FeedUserDaoV1.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.FeedUserDaoV1();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.id = $root.LiftLog.Ui.Models.UuidDao.decode(reader, reader.uint32());
                                break;
                            }
                        case 9: {
                                message.lookup = $root.google.protobuf.StringValue.decode(reader, reader.uint32());
                                break;
                            }
                        case 8: {
                                message.publicKey = reader.bytes();
                                break;
                            }
                        case 2: {
                                message.name = $root.google.protobuf.StringValue.decode(reader, reader.uint32());
                                break;
                            }
                        case 6: {
                                message.nickname = $root.google.protobuf.StringValue.decode(reader, reader.uint32());
                                break;
                            }
                        case 3: {
                                message.currentPlan = $root.LiftLog.Ui.Models.CurrentPlanDaoV1.decode(reader, reader.uint32());
                                break;
                            }
                        case 4: {
                                message.profilePicture = reader.bytes();
                                break;
                            }
                        case 5: {
                                message.aesKey = reader.bytes();
                                break;
                            }
                        case 7: {
                                message.followSecret = $root.google.protobuf.StringValue.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a FeedUserDaoV1 message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.FeedUserDaoV1} FeedUserDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FeedUserDaoV1.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a FeedUserDaoV1 message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                FeedUserDaoV1.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    let properties = {};
                    if (message.id != null && message.hasOwnProperty("id")) {
                        let error = $root.LiftLog.Ui.Models.UuidDao.verify(message.id);
                        if (error)
                            return "id." + error;
                    }
                    if (message.lookup != null && message.hasOwnProperty("lookup")) {
                        let error = $root.google.protobuf.StringValue.verify(message.lookup);
                        if (error)
                            return "lookup." + error;
                    }
                    if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                        if (!(message.publicKey && typeof message.publicKey.length === "number" || $util.isString(message.publicKey)))
                            return "publicKey: buffer expected";
                    if (message.name != null && message.hasOwnProperty("name")) {
                        properties._name = 1;
                        {
                            let error = $root.google.protobuf.StringValue.verify(message.name);
                            if (error)
                                return "name." + error;
                        }
                    }
                    if (message.nickname != null && message.hasOwnProperty("nickname")) {
                        properties._nickname = 1;
                        {
                            let error = $root.google.protobuf.StringValue.verify(message.nickname);
                            if (error)
                                return "nickname." + error;
                        }
                    }
                    if (message.currentPlan != null && message.hasOwnProperty("currentPlan")) {
                        properties._currentPlan = 1;
                        {
                            let error = $root.LiftLog.Ui.Models.CurrentPlanDaoV1.verify(message.currentPlan);
                            if (error)
                                return "currentPlan." + error;
                        }
                    }
                    if (message.profilePicture != null && message.hasOwnProperty("profilePicture")) {
                        properties._profilePicture = 1;
                        if (!(message.profilePicture && typeof message.profilePicture.length === "number" || $util.isString(message.profilePicture)))
                            return "profilePicture: buffer expected";
                    }
                    if (message.aesKey != null && message.hasOwnProperty("aesKey")) {
                        properties._aesKey = 1;
                        if (!(message.aesKey && typeof message.aesKey.length === "number" || $util.isString(message.aesKey)))
                            return "aesKey: buffer expected";
                    }
                    if (message.followSecret != null && message.hasOwnProperty("followSecret")) {
                        properties._followSecret = 1;
                        {
                            let error = $root.google.protobuf.StringValue.verify(message.followSecret);
                            if (error)
                                return "followSecret." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a FeedUserDaoV1 message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.FeedUserDaoV1} FeedUserDaoV1
                 */
                FeedUserDaoV1.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.FeedUserDaoV1)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.FeedUserDaoV1();
                    if (object.id != null) {
                        if (typeof object.id !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FeedUserDaoV1.id: object expected");
                        message.id = $root.LiftLog.Ui.Models.UuidDao.fromObject(object.id);
                    }
                    if (object.lookup != null) {
                        if (typeof object.lookup !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FeedUserDaoV1.lookup: object expected");
                        message.lookup = $root.google.protobuf.StringValue.fromObject(object.lookup);
                    }
                    if (object.publicKey != null)
                        if (typeof object.publicKey === "string")
                            $util.base64.decode(object.publicKey, message.publicKey = $util.newBuffer($util.base64.length(object.publicKey)), 0);
                        else if (object.publicKey.length >= 0)
                            message.publicKey = object.publicKey;
                    if (object.name != null) {
                        if (typeof object.name !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FeedUserDaoV1.name: object expected");
                        message.name = $root.google.protobuf.StringValue.fromObject(object.name);
                    }
                    if (object.nickname != null) {
                        if (typeof object.nickname !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FeedUserDaoV1.nickname: object expected");
                        message.nickname = $root.google.protobuf.StringValue.fromObject(object.nickname);
                    }
                    if (object.currentPlan != null) {
                        if (typeof object.currentPlan !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FeedUserDaoV1.currentPlan: object expected");
                        message.currentPlan = $root.LiftLog.Ui.Models.CurrentPlanDaoV1.fromObject(object.currentPlan);
                    }
                    if (object.profilePicture != null)
                        if (typeof object.profilePicture === "string")
                            $util.base64.decode(object.profilePicture, message.profilePicture = $util.newBuffer($util.base64.length(object.profilePicture)), 0);
                        else if (object.profilePicture.length >= 0)
                            message.profilePicture = object.profilePicture;
                    if (object.aesKey != null)
                        if (typeof object.aesKey === "string")
                            $util.base64.decode(object.aesKey, message.aesKey = $util.newBuffer($util.base64.length(object.aesKey)), 0);
                        else if (object.aesKey.length >= 0)
                            message.aesKey = object.aesKey;
                    if (object.followSecret != null) {
                        if (typeof object.followSecret !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FeedUserDaoV1.followSecret: object expected");
                        message.followSecret = $root.google.protobuf.StringValue.fromObject(object.followSecret);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a FeedUserDaoV1 message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.FeedUserDaoV1} message FeedUserDaoV1
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                FeedUserDaoV1.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.id = null;
                        if (options.bytes === String)
                            object.publicKey = "";
                        else {
                            object.publicKey = [];
                            if (options.bytes !== Array)
                                object.publicKey = $util.newBuffer(object.publicKey);
                        }
                        object.lookup = null;
                    }
                    if (message.id != null && message.hasOwnProperty("id"))
                        object.id = $root.LiftLog.Ui.Models.UuidDao.toObject(message.id, options);
                    if (message.name != null && message.hasOwnProperty("name")) {
                        object.name = $root.google.protobuf.StringValue.toObject(message.name, options);
                        if (options.oneofs)
                            object._name = "name";
                    }
                    if (message.currentPlan != null && message.hasOwnProperty("currentPlan")) {
                        object.currentPlan = $root.LiftLog.Ui.Models.CurrentPlanDaoV1.toObject(message.currentPlan, options);
                        if (options.oneofs)
                            object._currentPlan = "currentPlan";
                    }
                    if (message.profilePicture != null && message.hasOwnProperty("profilePicture")) {
                        object.profilePicture = options.bytes === String ? $util.base64.encode(message.profilePicture, 0, message.profilePicture.length) : options.bytes === Array ? Array.prototype.slice.call(message.profilePicture) : message.profilePicture;
                        if (options.oneofs)
                            object._profilePicture = "profilePicture";
                    }
                    if (message.aesKey != null && message.hasOwnProperty("aesKey")) {
                        object.aesKey = options.bytes === String ? $util.base64.encode(message.aesKey, 0, message.aesKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.aesKey) : message.aesKey;
                        if (options.oneofs)
                            object._aesKey = "aesKey";
                    }
                    if (message.nickname != null && message.hasOwnProperty("nickname")) {
                        object.nickname = $root.google.protobuf.StringValue.toObject(message.nickname, options);
                        if (options.oneofs)
                            object._nickname = "nickname";
                    }
                    if (message.followSecret != null && message.hasOwnProperty("followSecret")) {
                        object.followSecret = $root.google.protobuf.StringValue.toObject(message.followSecret, options);
                        if (options.oneofs)
                            object._followSecret = "followSecret";
                    }
                    if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                        object.publicKey = options.bytes === String ? $util.base64.encode(message.publicKey, 0, message.publicKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.publicKey) : message.publicKey;
                    if (message.lookup != null && message.hasOwnProperty("lookup"))
                        object.lookup = $root.google.protobuf.StringValue.toObject(message.lookup, options);
                    return object;
                };

                /**
                 * Converts this FeedUserDaoV1 to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                FeedUserDaoV1.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for FeedUserDaoV1
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.FeedUserDaoV1
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                FeedUserDaoV1.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.FeedUserDaoV1";
                };

                return FeedUserDaoV1;
            })();

            Models.CurrentPlanDaoV1 = (function() {

                /**
                 * Properties of a CurrentPlanDaoV1.
                 * @memberof LiftLog.Ui.Models
                 * @interface ICurrentPlanDaoV1
                 * @property {Array.<LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2>|null} [sessions] CurrentPlanDaoV1 sessions
                 */

                /**
                 * Constructs a new CurrentPlanDaoV1.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents a CurrentPlanDaoV1.
                 * @implements ICurrentPlanDaoV1
                 * @constructor
                 * @param {LiftLog.Ui.Models.ICurrentPlanDaoV1=} [properties] Properties to set
                 */
                function CurrentPlanDaoV1(properties) {
                    this.sessions = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * CurrentPlanDaoV1 sessions.
                 * @member {Array.<LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2>} sessions
                 * @memberof LiftLog.Ui.Models.CurrentPlanDaoV1
                 * @instance
                 */
                CurrentPlanDaoV1.prototype.sessions = $util.emptyArray;

                /**
                 * Creates a new CurrentPlanDaoV1 instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.CurrentPlanDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.ICurrentPlanDaoV1=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.CurrentPlanDaoV1} CurrentPlanDaoV1 instance
                 */
                CurrentPlanDaoV1.create = function create(properties) {
                    return new CurrentPlanDaoV1(properties);
                };

                /**
                 * Encodes the specified CurrentPlanDaoV1 message. Does not implicitly {@link LiftLog.Ui.Models.CurrentPlanDaoV1.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.CurrentPlanDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.ICurrentPlanDaoV1} message CurrentPlanDaoV1 message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                CurrentPlanDaoV1.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.sessions != null && message.sessions.length)
                        for (let i = 0; i < message.sessions.length; ++i)
                            $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.encode(message.sessions[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified CurrentPlanDaoV1 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.CurrentPlanDaoV1.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.CurrentPlanDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.ICurrentPlanDaoV1} message CurrentPlanDaoV1 message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                CurrentPlanDaoV1.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a CurrentPlanDaoV1 message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.CurrentPlanDaoV1
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.CurrentPlanDaoV1} CurrentPlanDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                CurrentPlanDaoV1.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.CurrentPlanDaoV1();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                if (!(message.sessions && message.sessions.length))
                                    message.sessions = [];
                                message.sessions.push($root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.decode(reader, reader.uint32()));
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a CurrentPlanDaoV1 message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.CurrentPlanDaoV1
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.CurrentPlanDaoV1} CurrentPlanDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                CurrentPlanDaoV1.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a CurrentPlanDaoV1 message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.CurrentPlanDaoV1
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                CurrentPlanDaoV1.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.sessions != null && message.hasOwnProperty("sessions")) {
                        if (!Array.isArray(message.sessions))
                            return "sessions: array expected";
                        for (let i = 0; i < message.sessions.length; ++i) {
                            let error = $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.verify(message.sessions[i]);
                            if (error)
                                return "sessions." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a CurrentPlanDaoV1 message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.CurrentPlanDaoV1
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.CurrentPlanDaoV1} CurrentPlanDaoV1
                 */
                CurrentPlanDaoV1.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.CurrentPlanDaoV1)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.CurrentPlanDaoV1();
                    if (object.sessions) {
                        if (!Array.isArray(object.sessions))
                            throw TypeError(".LiftLog.Ui.Models.CurrentPlanDaoV1.sessions: array expected");
                        message.sessions = [];
                        for (let i = 0; i < object.sessions.length; ++i) {
                            if (typeof object.sessions[i] !== "object")
                                throw TypeError(".LiftLog.Ui.Models.CurrentPlanDaoV1.sessions: object expected");
                            message.sessions[i] = $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.fromObject(object.sessions[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a CurrentPlanDaoV1 message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.CurrentPlanDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.CurrentPlanDaoV1} message CurrentPlanDaoV1
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                CurrentPlanDaoV1.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.sessions = [];
                    if (message.sessions && message.sessions.length) {
                        object.sessions = [];
                        for (let j = 0; j < message.sessions.length; ++j)
                            object.sessions[j] = $root.LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.toObject(message.sessions[j], options);
                    }
                    return object;
                };

                /**
                 * Converts this CurrentPlanDaoV1 to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.CurrentPlanDaoV1
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                CurrentPlanDaoV1.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for CurrentPlanDaoV1
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.CurrentPlanDaoV1
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                CurrentPlanDaoV1.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.CurrentPlanDaoV1";
                };

                return CurrentPlanDaoV1;
            })();

            Models.FeedItemDaoV1 = (function() {

                /**
                 * Properties of a FeedItemDaoV1.
                 * @memberof LiftLog.Ui.Models
                 * @interface IFeedItemDaoV1
                 * @property {LiftLog.Ui.Models.IUuidDao|null} [userId] FeedItemDaoV1 userId
                 * @property {LiftLog.Ui.Models.IUuidDao|null} [eventId] FeedItemDaoV1 eventId
                 * @property {google.protobuf.ITimestamp|null} [timestamp] FeedItemDaoV1 timestamp
                 * @property {google.protobuf.ITimestamp|null} [expiry] FeedItemDaoV1 expiry
                 * @property {LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null} [session] FeedItemDaoV1 session
                 */

                /**
                 * Constructs a new FeedItemDaoV1.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents a FeedItemDaoV1.
                 * @implements IFeedItemDaoV1
                 * @constructor
                 * @param {LiftLog.Ui.Models.IFeedItemDaoV1=} [properties] Properties to set
                 */
                function FeedItemDaoV1(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * FeedItemDaoV1 userId.
                 * @member {LiftLog.Ui.Models.IUuidDao|null|undefined} userId
                 * @memberof LiftLog.Ui.Models.FeedItemDaoV1
                 * @instance
                 */
                FeedItemDaoV1.prototype.userId = null;

                /**
                 * FeedItemDaoV1 eventId.
                 * @member {LiftLog.Ui.Models.IUuidDao|null|undefined} eventId
                 * @memberof LiftLog.Ui.Models.FeedItemDaoV1
                 * @instance
                 */
                FeedItemDaoV1.prototype.eventId = null;

                /**
                 * FeedItemDaoV1 timestamp.
                 * @member {google.protobuf.ITimestamp|null|undefined} timestamp
                 * @memberof LiftLog.Ui.Models.FeedItemDaoV1
                 * @instance
                 */
                FeedItemDaoV1.prototype.timestamp = null;

                /**
                 * FeedItemDaoV1 expiry.
                 * @member {google.protobuf.ITimestamp|null|undefined} expiry
                 * @memberof LiftLog.Ui.Models.FeedItemDaoV1
                 * @instance
                 */
                FeedItemDaoV1.prototype.expiry = null;

                /**
                 * FeedItemDaoV1 session.
                 * @member {LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null|undefined} session
                 * @memberof LiftLog.Ui.Models.FeedItemDaoV1
                 * @instance
                 */
                FeedItemDaoV1.prototype.session = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * FeedItemDaoV1 payload.
                 * @member {"session"|undefined} payload
                 * @memberof LiftLog.Ui.Models.FeedItemDaoV1
                 * @instance
                 */
                Object.defineProperty(FeedItemDaoV1.prototype, "payload", {
                    get: $util.oneOfGetter($oneOfFields = ["session"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new FeedItemDaoV1 instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.FeedItemDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.IFeedItemDaoV1=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.FeedItemDaoV1} FeedItemDaoV1 instance
                 */
                FeedItemDaoV1.create = function create(properties) {
                    return new FeedItemDaoV1(properties);
                };

                /**
                 * Encodes the specified FeedItemDaoV1 message. Does not implicitly {@link LiftLog.Ui.Models.FeedItemDaoV1.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.FeedItemDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.IFeedItemDaoV1} message FeedItemDaoV1 message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FeedItemDaoV1.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                        $root.LiftLog.Ui.Models.UuidDao.encode(message.userId, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.eventId != null && Object.hasOwnProperty.call(message, "eventId"))
                        $root.LiftLog.Ui.Models.UuidDao.encode(message.eventId, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                        $root.google.protobuf.Timestamp.encode(message.timestamp, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    if (message.expiry != null && Object.hasOwnProperty.call(message, "expiry"))
                        $root.google.protobuf.Timestamp.encode(message.expiry, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                    if (message.session != null && Object.hasOwnProperty.call(message, "session"))
                        $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.encode(message.session, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified FeedItemDaoV1 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.FeedItemDaoV1.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.FeedItemDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.IFeedItemDaoV1} message FeedItemDaoV1 message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FeedItemDaoV1.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a FeedItemDaoV1 message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.FeedItemDaoV1
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.FeedItemDaoV1} FeedItemDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FeedItemDaoV1.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.FeedItemDaoV1();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.userId = $root.LiftLog.Ui.Models.UuidDao.decode(reader, reader.uint32());
                                break;
                            }
                        case 2: {
                                message.eventId = $root.LiftLog.Ui.Models.UuidDao.decode(reader, reader.uint32());
                                break;
                            }
                        case 3: {
                                message.timestamp = $root.google.protobuf.Timestamp.decode(reader, reader.uint32());
                                break;
                            }
                        case 4: {
                                message.expiry = $root.google.protobuf.Timestamp.decode(reader, reader.uint32());
                                break;
                            }
                        case 5: {
                                message.session = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a FeedItemDaoV1 message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.FeedItemDaoV1
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.FeedItemDaoV1} FeedItemDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FeedItemDaoV1.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a FeedItemDaoV1 message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.FeedItemDaoV1
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                FeedItemDaoV1.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    let properties = {};
                    if (message.userId != null && message.hasOwnProperty("userId")) {
                        let error = $root.LiftLog.Ui.Models.UuidDao.verify(message.userId);
                        if (error)
                            return "userId." + error;
                    }
                    if (message.eventId != null && message.hasOwnProperty("eventId")) {
                        let error = $root.LiftLog.Ui.Models.UuidDao.verify(message.eventId);
                        if (error)
                            return "eventId." + error;
                    }
                    if (message.timestamp != null && message.hasOwnProperty("timestamp")) {
                        let error = $root.google.protobuf.Timestamp.verify(message.timestamp);
                        if (error)
                            return "timestamp." + error;
                    }
                    if (message.expiry != null && message.hasOwnProperty("expiry")) {
                        let error = $root.google.protobuf.Timestamp.verify(message.expiry);
                        if (error)
                            return "expiry." + error;
                    }
                    if (message.session != null && message.hasOwnProperty("session")) {
                        properties.payload = 1;
                        {
                            let error = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.verify(message.session);
                            if (error)
                                return "session." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a FeedItemDaoV1 message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.FeedItemDaoV1
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.FeedItemDaoV1} FeedItemDaoV1
                 */
                FeedItemDaoV1.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.FeedItemDaoV1)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.FeedItemDaoV1();
                    if (object.userId != null) {
                        if (typeof object.userId !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FeedItemDaoV1.userId: object expected");
                        message.userId = $root.LiftLog.Ui.Models.UuidDao.fromObject(object.userId);
                    }
                    if (object.eventId != null) {
                        if (typeof object.eventId !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FeedItemDaoV1.eventId: object expected");
                        message.eventId = $root.LiftLog.Ui.Models.UuidDao.fromObject(object.eventId);
                    }
                    if (object.timestamp != null) {
                        if (typeof object.timestamp !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FeedItemDaoV1.timestamp: object expected");
                        message.timestamp = $root.google.protobuf.Timestamp.fromObject(object.timestamp);
                    }
                    if (object.expiry != null) {
                        if (typeof object.expiry !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FeedItemDaoV1.expiry: object expected");
                        message.expiry = $root.google.protobuf.Timestamp.fromObject(object.expiry);
                    }
                    if (object.session != null) {
                        if (typeof object.session !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FeedItemDaoV1.session: object expected");
                        message.session = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.fromObject(object.session);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a FeedItemDaoV1 message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.FeedItemDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.FeedItemDaoV1} message FeedItemDaoV1
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                FeedItemDaoV1.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.userId = null;
                        object.eventId = null;
                        object.timestamp = null;
                        object.expiry = null;
                    }
                    if (message.userId != null && message.hasOwnProperty("userId"))
                        object.userId = $root.LiftLog.Ui.Models.UuidDao.toObject(message.userId, options);
                    if (message.eventId != null && message.hasOwnProperty("eventId"))
                        object.eventId = $root.LiftLog.Ui.Models.UuidDao.toObject(message.eventId, options);
                    if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                        object.timestamp = $root.google.protobuf.Timestamp.toObject(message.timestamp, options);
                    if (message.expiry != null && message.hasOwnProperty("expiry"))
                        object.expiry = $root.google.protobuf.Timestamp.toObject(message.expiry, options);
                    if (message.session != null && message.hasOwnProperty("session")) {
                        object.session = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.toObject(message.session, options);
                        if (options.oneofs)
                            object.payload = "session";
                    }
                    return object;
                };

                /**
                 * Converts this FeedItemDaoV1 to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.FeedItemDaoV1
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                FeedItemDaoV1.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for FeedItemDaoV1
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.FeedItemDaoV1
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                FeedItemDaoV1.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.FeedItemDaoV1";
                };

                return FeedItemDaoV1;
            })();

            Models.FeedStateDaoV1 = (function() {

                /**
                 * Properties of a FeedStateDaoV1.
                 * @memberof LiftLog.Ui.Models
                 * @interface IFeedStateDaoV1
                 * @property {Array.<LiftLog.Ui.Models.IFeedItemDaoV1>|null} [feedItems] FeedStateDaoV1 feedItems
                 * @property {Array.<LiftLog.Ui.Models.IFeedUserDaoV1>|null} [followedUsers] FeedStateDaoV1 followedUsers
                 * @property {LiftLog.Ui.Models.IFeedIdentityDaoV1|null} [identity] FeedStateDaoV1 identity
                 * @property {Array.<LiftLog.Ui.Models.IInboxMessageDao>|null} [followRequests] FeedStateDaoV1 followRequests
                 * @property {Array.<LiftLog.Ui.Models.IFeedUserDaoV1>|null} [followers] FeedStateDaoV1 followers
                 * @property {Array.<LiftLog.Ui.Models.IUuidDao>|null} [unpublishedSessionIds] FeedStateDaoV1 unpublishedSessionIds
                 */

                /**
                 * Constructs a new FeedStateDaoV1.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents a FeedStateDaoV1.
                 * @implements IFeedStateDaoV1
                 * @constructor
                 * @param {LiftLog.Ui.Models.IFeedStateDaoV1=} [properties] Properties to set
                 */
                function FeedStateDaoV1(properties) {
                    this.feedItems = [];
                    this.followedUsers = [];
                    this.followRequests = [];
                    this.followers = [];
                    this.unpublishedSessionIds = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * FeedStateDaoV1 feedItems.
                 * @member {Array.<LiftLog.Ui.Models.IFeedItemDaoV1>} feedItems
                 * @memberof LiftLog.Ui.Models.FeedStateDaoV1
                 * @instance
                 */
                FeedStateDaoV1.prototype.feedItems = $util.emptyArray;

                /**
                 * FeedStateDaoV1 followedUsers.
                 * @member {Array.<LiftLog.Ui.Models.IFeedUserDaoV1>} followedUsers
                 * @memberof LiftLog.Ui.Models.FeedStateDaoV1
                 * @instance
                 */
                FeedStateDaoV1.prototype.followedUsers = $util.emptyArray;

                /**
                 * FeedStateDaoV1 identity.
                 * @member {LiftLog.Ui.Models.IFeedIdentityDaoV1|null|undefined} identity
                 * @memberof LiftLog.Ui.Models.FeedStateDaoV1
                 * @instance
                 */
                FeedStateDaoV1.prototype.identity = null;

                /**
                 * FeedStateDaoV1 followRequests.
                 * @member {Array.<LiftLog.Ui.Models.IInboxMessageDao>} followRequests
                 * @memberof LiftLog.Ui.Models.FeedStateDaoV1
                 * @instance
                 */
                FeedStateDaoV1.prototype.followRequests = $util.emptyArray;

                /**
                 * FeedStateDaoV1 followers.
                 * @member {Array.<LiftLog.Ui.Models.IFeedUserDaoV1>} followers
                 * @memberof LiftLog.Ui.Models.FeedStateDaoV1
                 * @instance
                 */
                FeedStateDaoV1.prototype.followers = $util.emptyArray;

                /**
                 * FeedStateDaoV1 unpublishedSessionIds.
                 * @member {Array.<LiftLog.Ui.Models.IUuidDao>} unpublishedSessionIds
                 * @memberof LiftLog.Ui.Models.FeedStateDaoV1
                 * @instance
                 */
                FeedStateDaoV1.prototype.unpublishedSessionIds = $util.emptyArray;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * FeedStateDaoV1 _identity.
                 * @member {"identity"|undefined} _identity
                 * @memberof LiftLog.Ui.Models.FeedStateDaoV1
                 * @instance
                 */
                Object.defineProperty(FeedStateDaoV1.prototype, "_identity", {
                    get: $util.oneOfGetter($oneOfFields = ["identity"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new FeedStateDaoV1 instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.FeedStateDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.IFeedStateDaoV1=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.FeedStateDaoV1} FeedStateDaoV1 instance
                 */
                FeedStateDaoV1.create = function create(properties) {
                    return new FeedStateDaoV1(properties);
                };

                /**
                 * Encodes the specified FeedStateDaoV1 message. Does not implicitly {@link LiftLog.Ui.Models.FeedStateDaoV1.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.FeedStateDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.IFeedStateDaoV1} message FeedStateDaoV1 message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FeedStateDaoV1.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.feedItems != null && message.feedItems.length)
                        for (let i = 0; i < message.feedItems.length; ++i)
                            $root.LiftLog.Ui.Models.FeedItemDaoV1.encode(message.feedItems[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.followedUsers != null && message.followedUsers.length)
                        for (let i = 0; i < message.followedUsers.length; ++i)
                            $root.LiftLog.Ui.Models.FeedUserDaoV1.encode(message.followedUsers[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.identity != null && Object.hasOwnProperty.call(message, "identity"))
                        $root.LiftLog.Ui.Models.FeedIdentityDaoV1.encode(message.identity, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    if (message.followRequests != null && message.followRequests.length)
                        for (let i = 0; i < message.followRequests.length; ++i)
                            $root.LiftLog.Ui.Models.InboxMessageDao.encode(message.followRequests[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                    if (message.followers != null && message.followers.length)
                        for (let i = 0; i < message.followers.length; ++i)
                            $root.LiftLog.Ui.Models.FeedUserDaoV1.encode(message.followers[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                    if (message.unpublishedSessionIds != null && message.unpublishedSessionIds.length)
                        for (let i = 0; i < message.unpublishedSessionIds.length; ++i)
                            $root.LiftLog.Ui.Models.UuidDao.encode(message.unpublishedSessionIds[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified FeedStateDaoV1 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.FeedStateDaoV1.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.FeedStateDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.IFeedStateDaoV1} message FeedStateDaoV1 message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FeedStateDaoV1.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a FeedStateDaoV1 message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.FeedStateDaoV1
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.FeedStateDaoV1} FeedStateDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FeedStateDaoV1.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.FeedStateDaoV1();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                if (!(message.feedItems && message.feedItems.length))
                                    message.feedItems = [];
                                message.feedItems.push($root.LiftLog.Ui.Models.FeedItemDaoV1.decode(reader, reader.uint32()));
                                break;
                            }
                        case 2: {
                                if (!(message.followedUsers && message.followedUsers.length))
                                    message.followedUsers = [];
                                message.followedUsers.push($root.LiftLog.Ui.Models.FeedUserDaoV1.decode(reader, reader.uint32()));
                                break;
                            }
                        case 3: {
                                message.identity = $root.LiftLog.Ui.Models.FeedIdentityDaoV1.decode(reader, reader.uint32());
                                break;
                            }
                        case 4: {
                                if (!(message.followRequests && message.followRequests.length))
                                    message.followRequests = [];
                                message.followRequests.push($root.LiftLog.Ui.Models.InboxMessageDao.decode(reader, reader.uint32()));
                                break;
                            }
                        case 5: {
                                if (!(message.followers && message.followers.length))
                                    message.followers = [];
                                message.followers.push($root.LiftLog.Ui.Models.FeedUserDaoV1.decode(reader, reader.uint32()));
                                break;
                            }
                        case 6: {
                                if (!(message.unpublishedSessionIds && message.unpublishedSessionIds.length))
                                    message.unpublishedSessionIds = [];
                                message.unpublishedSessionIds.push($root.LiftLog.Ui.Models.UuidDao.decode(reader, reader.uint32()));
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a FeedStateDaoV1 message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.FeedStateDaoV1
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.FeedStateDaoV1} FeedStateDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FeedStateDaoV1.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a FeedStateDaoV1 message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.FeedStateDaoV1
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                FeedStateDaoV1.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    let properties = {};
                    if (message.feedItems != null && message.hasOwnProperty("feedItems")) {
                        if (!Array.isArray(message.feedItems))
                            return "feedItems: array expected";
                        for (let i = 0; i < message.feedItems.length; ++i) {
                            let error = $root.LiftLog.Ui.Models.FeedItemDaoV1.verify(message.feedItems[i]);
                            if (error)
                                return "feedItems." + error;
                        }
                    }
                    if (message.followedUsers != null && message.hasOwnProperty("followedUsers")) {
                        if (!Array.isArray(message.followedUsers))
                            return "followedUsers: array expected";
                        for (let i = 0; i < message.followedUsers.length; ++i) {
                            let error = $root.LiftLog.Ui.Models.FeedUserDaoV1.verify(message.followedUsers[i]);
                            if (error)
                                return "followedUsers." + error;
                        }
                    }
                    if (message.identity != null && message.hasOwnProperty("identity")) {
                        properties._identity = 1;
                        {
                            let error = $root.LiftLog.Ui.Models.FeedIdentityDaoV1.verify(message.identity);
                            if (error)
                                return "identity." + error;
                        }
                    }
                    if (message.followRequests != null && message.hasOwnProperty("followRequests")) {
                        if (!Array.isArray(message.followRequests))
                            return "followRequests: array expected";
                        for (let i = 0; i < message.followRequests.length; ++i) {
                            let error = $root.LiftLog.Ui.Models.InboxMessageDao.verify(message.followRequests[i]);
                            if (error)
                                return "followRequests." + error;
                        }
                    }
                    if (message.followers != null && message.hasOwnProperty("followers")) {
                        if (!Array.isArray(message.followers))
                            return "followers: array expected";
                        for (let i = 0; i < message.followers.length; ++i) {
                            let error = $root.LiftLog.Ui.Models.FeedUserDaoV1.verify(message.followers[i]);
                            if (error)
                                return "followers." + error;
                        }
                    }
                    if (message.unpublishedSessionIds != null && message.hasOwnProperty("unpublishedSessionIds")) {
                        if (!Array.isArray(message.unpublishedSessionIds))
                            return "unpublishedSessionIds: array expected";
                        for (let i = 0; i < message.unpublishedSessionIds.length; ++i) {
                            let error = $root.LiftLog.Ui.Models.UuidDao.verify(message.unpublishedSessionIds[i]);
                            if (error)
                                return "unpublishedSessionIds." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a FeedStateDaoV1 message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.FeedStateDaoV1
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.FeedStateDaoV1} FeedStateDaoV1
                 */
                FeedStateDaoV1.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.FeedStateDaoV1)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.FeedStateDaoV1();
                    if (object.feedItems) {
                        if (!Array.isArray(object.feedItems))
                            throw TypeError(".LiftLog.Ui.Models.FeedStateDaoV1.feedItems: array expected");
                        message.feedItems = [];
                        for (let i = 0; i < object.feedItems.length; ++i) {
                            if (typeof object.feedItems[i] !== "object")
                                throw TypeError(".LiftLog.Ui.Models.FeedStateDaoV1.feedItems: object expected");
                            message.feedItems[i] = $root.LiftLog.Ui.Models.FeedItemDaoV1.fromObject(object.feedItems[i]);
                        }
                    }
                    if (object.followedUsers) {
                        if (!Array.isArray(object.followedUsers))
                            throw TypeError(".LiftLog.Ui.Models.FeedStateDaoV1.followedUsers: array expected");
                        message.followedUsers = [];
                        for (let i = 0; i < object.followedUsers.length; ++i) {
                            if (typeof object.followedUsers[i] !== "object")
                                throw TypeError(".LiftLog.Ui.Models.FeedStateDaoV1.followedUsers: object expected");
                            message.followedUsers[i] = $root.LiftLog.Ui.Models.FeedUserDaoV1.fromObject(object.followedUsers[i]);
                        }
                    }
                    if (object.identity != null) {
                        if (typeof object.identity !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FeedStateDaoV1.identity: object expected");
                        message.identity = $root.LiftLog.Ui.Models.FeedIdentityDaoV1.fromObject(object.identity);
                    }
                    if (object.followRequests) {
                        if (!Array.isArray(object.followRequests))
                            throw TypeError(".LiftLog.Ui.Models.FeedStateDaoV1.followRequests: array expected");
                        message.followRequests = [];
                        for (let i = 0; i < object.followRequests.length; ++i) {
                            if (typeof object.followRequests[i] !== "object")
                                throw TypeError(".LiftLog.Ui.Models.FeedStateDaoV1.followRequests: object expected");
                            message.followRequests[i] = $root.LiftLog.Ui.Models.InboxMessageDao.fromObject(object.followRequests[i]);
                        }
                    }
                    if (object.followers) {
                        if (!Array.isArray(object.followers))
                            throw TypeError(".LiftLog.Ui.Models.FeedStateDaoV1.followers: array expected");
                        message.followers = [];
                        for (let i = 0; i < object.followers.length; ++i) {
                            if (typeof object.followers[i] !== "object")
                                throw TypeError(".LiftLog.Ui.Models.FeedStateDaoV1.followers: object expected");
                            message.followers[i] = $root.LiftLog.Ui.Models.FeedUserDaoV1.fromObject(object.followers[i]);
                        }
                    }
                    if (object.unpublishedSessionIds) {
                        if (!Array.isArray(object.unpublishedSessionIds))
                            throw TypeError(".LiftLog.Ui.Models.FeedStateDaoV1.unpublishedSessionIds: array expected");
                        message.unpublishedSessionIds = [];
                        for (let i = 0; i < object.unpublishedSessionIds.length; ++i) {
                            if (typeof object.unpublishedSessionIds[i] !== "object")
                                throw TypeError(".LiftLog.Ui.Models.FeedStateDaoV1.unpublishedSessionIds: object expected");
                            message.unpublishedSessionIds[i] = $root.LiftLog.Ui.Models.UuidDao.fromObject(object.unpublishedSessionIds[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a FeedStateDaoV1 message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.FeedStateDaoV1
                 * @static
                 * @param {LiftLog.Ui.Models.FeedStateDaoV1} message FeedStateDaoV1
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                FeedStateDaoV1.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults) {
                        object.feedItems = [];
                        object.followedUsers = [];
                        object.followRequests = [];
                        object.followers = [];
                        object.unpublishedSessionIds = [];
                    }
                    if (message.feedItems && message.feedItems.length) {
                        object.feedItems = [];
                        for (let j = 0; j < message.feedItems.length; ++j)
                            object.feedItems[j] = $root.LiftLog.Ui.Models.FeedItemDaoV1.toObject(message.feedItems[j], options);
                    }
                    if (message.followedUsers && message.followedUsers.length) {
                        object.followedUsers = [];
                        for (let j = 0; j < message.followedUsers.length; ++j)
                            object.followedUsers[j] = $root.LiftLog.Ui.Models.FeedUserDaoV1.toObject(message.followedUsers[j], options);
                    }
                    if (message.identity != null && message.hasOwnProperty("identity")) {
                        object.identity = $root.LiftLog.Ui.Models.FeedIdentityDaoV1.toObject(message.identity, options);
                        if (options.oneofs)
                            object._identity = "identity";
                    }
                    if (message.followRequests && message.followRequests.length) {
                        object.followRequests = [];
                        for (let j = 0; j < message.followRequests.length; ++j)
                            object.followRequests[j] = $root.LiftLog.Ui.Models.InboxMessageDao.toObject(message.followRequests[j], options);
                    }
                    if (message.followers && message.followers.length) {
                        object.followers = [];
                        for (let j = 0; j < message.followers.length; ++j)
                            object.followers[j] = $root.LiftLog.Ui.Models.FeedUserDaoV1.toObject(message.followers[j], options);
                    }
                    if (message.unpublishedSessionIds && message.unpublishedSessionIds.length) {
                        object.unpublishedSessionIds = [];
                        for (let j = 0; j < message.unpublishedSessionIds.length; ++j)
                            object.unpublishedSessionIds[j] = $root.LiftLog.Ui.Models.UuidDao.toObject(message.unpublishedSessionIds[j], options);
                    }
                    return object;
                };

                /**
                 * Converts this FeedStateDaoV1 to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.FeedStateDaoV1
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                FeedStateDaoV1.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for FeedStateDaoV1
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.FeedStateDaoV1
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                FeedStateDaoV1.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.FeedStateDaoV1";
                };

                return FeedStateDaoV1;
            })();

            Models.UserEventPayload = (function() {

                /**
                 * Properties of a UserEventPayload.
                 * @memberof LiftLog.Ui.Models
                 * @interface IUserEventPayload
                 * @property {LiftLog.Ui.Models.ISessionUserEvent|null} [sessionPayload] UserEventPayload sessionPayload
                 * @property {LiftLog.Ui.Models.IRemovedSessionUserEvent|null} [removedSessionPayload] UserEventPayload removedSessionPayload
                 */

                /**
                 * Constructs a new UserEventPayload.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents a UserEventPayload.
                 * @implements IUserEventPayload
                 * @constructor
                 * @param {LiftLog.Ui.Models.IUserEventPayload=} [properties] Properties to set
                 */
                function UserEventPayload(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * UserEventPayload sessionPayload.
                 * @member {LiftLog.Ui.Models.ISessionUserEvent|null|undefined} sessionPayload
                 * @memberof LiftLog.Ui.Models.UserEventPayload
                 * @instance
                 */
                UserEventPayload.prototype.sessionPayload = null;

                /**
                 * UserEventPayload removedSessionPayload.
                 * @member {LiftLog.Ui.Models.IRemovedSessionUserEvent|null|undefined} removedSessionPayload
                 * @memberof LiftLog.Ui.Models.UserEventPayload
                 * @instance
                 */
                UserEventPayload.prototype.removedSessionPayload = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * UserEventPayload eventPayload.
                 * @member {"sessionPayload"|"removedSessionPayload"|undefined} eventPayload
                 * @memberof LiftLog.Ui.Models.UserEventPayload
                 * @instance
                 */
                Object.defineProperty(UserEventPayload.prototype, "eventPayload", {
                    get: $util.oneOfGetter($oneOfFields = ["sessionPayload", "removedSessionPayload"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new UserEventPayload instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.UserEventPayload
                 * @static
                 * @param {LiftLog.Ui.Models.IUserEventPayload=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.UserEventPayload} UserEventPayload instance
                 */
                UserEventPayload.create = function create(properties) {
                    return new UserEventPayload(properties);
                };

                /**
                 * Encodes the specified UserEventPayload message. Does not implicitly {@link LiftLog.Ui.Models.UserEventPayload.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.UserEventPayload
                 * @static
                 * @param {LiftLog.Ui.Models.IUserEventPayload} message UserEventPayload message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                UserEventPayload.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.sessionPayload != null && Object.hasOwnProperty.call(message, "sessionPayload"))
                        $root.LiftLog.Ui.Models.SessionUserEvent.encode(message.sessionPayload, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.removedSessionPayload != null && Object.hasOwnProperty.call(message, "removedSessionPayload"))
                        $root.LiftLog.Ui.Models.RemovedSessionUserEvent.encode(message.removedSessionPayload, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified UserEventPayload message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.UserEventPayload.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.UserEventPayload
                 * @static
                 * @param {LiftLog.Ui.Models.IUserEventPayload} message UserEventPayload message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                UserEventPayload.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a UserEventPayload message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.UserEventPayload
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.UserEventPayload} UserEventPayload
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                UserEventPayload.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.UserEventPayload();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.sessionPayload = $root.LiftLog.Ui.Models.SessionUserEvent.decode(reader, reader.uint32());
                                break;
                            }
                        case 2: {
                                message.removedSessionPayload = $root.LiftLog.Ui.Models.RemovedSessionUserEvent.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a UserEventPayload message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.UserEventPayload
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.UserEventPayload} UserEventPayload
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                UserEventPayload.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a UserEventPayload message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.UserEventPayload
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                UserEventPayload.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    let properties = {};
                    if (message.sessionPayload != null && message.hasOwnProperty("sessionPayload")) {
                        properties.eventPayload = 1;
                        {
                            let error = $root.LiftLog.Ui.Models.SessionUserEvent.verify(message.sessionPayload);
                            if (error)
                                return "sessionPayload." + error;
                        }
                    }
                    if (message.removedSessionPayload != null && message.hasOwnProperty("removedSessionPayload")) {
                        if (properties.eventPayload === 1)
                            return "eventPayload: multiple values";
                        properties.eventPayload = 1;
                        {
                            let error = $root.LiftLog.Ui.Models.RemovedSessionUserEvent.verify(message.removedSessionPayload);
                            if (error)
                                return "removedSessionPayload." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a UserEventPayload message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.UserEventPayload
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.UserEventPayload} UserEventPayload
                 */
                UserEventPayload.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.UserEventPayload)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.UserEventPayload();
                    if (object.sessionPayload != null) {
                        if (typeof object.sessionPayload !== "object")
                            throw TypeError(".LiftLog.Ui.Models.UserEventPayload.sessionPayload: object expected");
                        message.sessionPayload = $root.LiftLog.Ui.Models.SessionUserEvent.fromObject(object.sessionPayload);
                    }
                    if (object.removedSessionPayload != null) {
                        if (typeof object.removedSessionPayload !== "object")
                            throw TypeError(".LiftLog.Ui.Models.UserEventPayload.removedSessionPayload: object expected");
                        message.removedSessionPayload = $root.LiftLog.Ui.Models.RemovedSessionUserEvent.fromObject(object.removedSessionPayload);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a UserEventPayload message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.UserEventPayload
                 * @static
                 * @param {LiftLog.Ui.Models.UserEventPayload} message UserEventPayload
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                UserEventPayload.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (message.sessionPayload != null && message.hasOwnProperty("sessionPayload")) {
                        object.sessionPayload = $root.LiftLog.Ui.Models.SessionUserEvent.toObject(message.sessionPayload, options);
                        if (options.oneofs)
                            object.eventPayload = "sessionPayload";
                    }
                    if (message.removedSessionPayload != null && message.hasOwnProperty("removedSessionPayload")) {
                        object.removedSessionPayload = $root.LiftLog.Ui.Models.RemovedSessionUserEvent.toObject(message.removedSessionPayload, options);
                        if (options.oneofs)
                            object.eventPayload = "removedSessionPayload";
                    }
                    return object;
                };

                /**
                 * Converts this UserEventPayload to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.UserEventPayload
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                UserEventPayload.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for UserEventPayload
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.UserEventPayload
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                UserEventPayload.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.UserEventPayload";
                };

                return UserEventPayload;
            })();

            Models.SessionUserEvent = (function() {

                /**
                 * Properties of a SessionUserEvent.
                 * @memberof LiftLog.Ui.Models
                 * @interface ISessionUserEvent
                 * @property {LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null} [session] SessionUserEvent session
                 */

                /**
                 * Constructs a new SessionUserEvent.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents a SessionUserEvent.
                 * @implements ISessionUserEvent
                 * @constructor
                 * @param {LiftLog.Ui.Models.ISessionUserEvent=} [properties] Properties to set
                 */
                function SessionUserEvent(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * SessionUserEvent session.
                 * @member {LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null|undefined} session
                 * @memberof LiftLog.Ui.Models.SessionUserEvent
                 * @instance
                 */
                SessionUserEvent.prototype.session = null;

                /**
                 * Creates a new SessionUserEvent instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.SessionUserEvent
                 * @static
                 * @param {LiftLog.Ui.Models.ISessionUserEvent=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.SessionUserEvent} SessionUserEvent instance
                 */
                SessionUserEvent.create = function create(properties) {
                    return new SessionUserEvent(properties);
                };

                /**
                 * Encodes the specified SessionUserEvent message. Does not implicitly {@link LiftLog.Ui.Models.SessionUserEvent.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.SessionUserEvent
                 * @static
                 * @param {LiftLog.Ui.Models.ISessionUserEvent} message SessionUserEvent message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SessionUserEvent.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.session != null && Object.hasOwnProperty.call(message, "session"))
                        $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.encode(message.session, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified SessionUserEvent message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionUserEvent.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.SessionUserEvent
                 * @static
                 * @param {LiftLog.Ui.Models.ISessionUserEvent} message SessionUserEvent message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SessionUserEvent.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a SessionUserEvent message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.SessionUserEvent
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.SessionUserEvent} SessionUserEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                SessionUserEvent.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.SessionUserEvent();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.session = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a SessionUserEvent message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.SessionUserEvent
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.SessionUserEvent} SessionUserEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                SessionUserEvent.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a SessionUserEvent message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.SessionUserEvent
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                SessionUserEvent.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.session != null && message.hasOwnProperty("session")) {
                        let error = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.verify(message.session);
                        if (error)
                            return "session." + error;
                    }
                    return null;
                };

                /**
                 * Creates a SessionUserEvent message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.SessionUserEvent
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.SessionUserEvent} SessionUserEvent
                 */
                SessionUserEvent.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.SessionUserEvent)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.SessionUserEvent();
                    if (object.session != null) {
                        if (typeof object.session !== "object")
                            throw TypeError(".LiftLog.Ui.Models.SessionUserEvent.session: object expected");
                        message.session = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.fromObject(object.session);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a SessionUserEvent message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.SessionUserEvent
                 * @static
                 * @param {LiftLog.Ui.Models.SessionUserEvent} message SessionUserEvent
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                SessionUserEvent.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults)
                        object.session = null;
                    if (message.session != null && message.hasOwnProperty("session"))
                        object.session = $root.LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.toObject(message.session, options);
                    return object;
                };

                /**
                 * Converts this SessionUserEvent to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.SessionUserEvent
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                SessionUserEvent.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for SessionUserEvent
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.SessionUserEvent
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                SessionUserEvent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.SessionUserEvent";
                };

                return SessionUserEvent;
            })();

            Models.RemovedSessionUserEvent = (function() {

                /**
                 * Properties of a RemovedSessionUserEvent.
                 * @memberof LiftLog.Ui.Models
                 * @interface IRemovedSessionUserEvent
                 * @property {LiftLog.Ui.Models.IUuidDao|null} [sessionId] RemovedSessionUserEvent sessionId
                 */

                /**
                 * Constructs a new RemovedSessionUserEvent.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents a RemovedSessionUserEvent.
                 * @implements IRemovedSessionUserEvent
                 * @constructor
                 * @param {LiftLog.Ui.Models.IRemovedSessionUserEvent=} [properties] Properties to set
                 */
                function RemovedSessionUserEvent(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * RemovedSessionUserEvent sessionId.
                 * @member {LiftLog.Ui.Models.IUuidDao|null|undefined} sessionId
                 * @memberof LiftLog.Ui.Models.RemovedSessionUserEvent
                 * @instance
                 */
                RemovedSessionUserEvent.prototype.sessionId = null;

                /**
                 * Creates a new RemovedSessionUserEvent instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.RemovedSessionUserEvent
                 * @static
                 * @param {LiftLog.Ui.Models.IRemovedSessionUserEvent=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.RemovedSessionUserEvent} RemovedSessionUserEvent instance
                 */
                RemovedSessionUserEvent.create = function create(properties) {
                    return new RemovedSessionUserEvent(properties);
                };

                /**
                 * Encodes the specified RemovedSessionUserEvent message. Does not implicitly {@link LiftLog.Ui.Models.RemovedSessionUserEvent.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.RemovedSessionUserEvent
                 * @static
                 * @param {LiftLog.Ui.Models.IRemovedSessionUserEvent} message RemovedSessionUserEvent message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                RemovedSessionUserEvent.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.sessionId != null && Object.hasOwnProperty.call(message, "sessionId"))
                        $root.LiftLog.Ui.Models.UuidDao.encode(message.sessionId, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified RemovedSessionUserEvent message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.RemovedSessionUserEvent.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.RemovedSessionUserEvent
                 * @static
                 * @param {LiftLog.Ui.Models.IRemovedSessionUserEvent} message RemovedSessionUserEvent message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                RemovedSessionUserEvent.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a RemovedSessionUserEvent message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.RemovedSessionUserEvent
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.RemovedSessionUserEvent} RemovedSessionUserEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                RemovedSessionUserEvent.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.RemovedSessionUserEvent();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.sessionId = $root.LiftLog.Ui.Models.UuidDao.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a RemovedSessionUserEvent message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.RemovedSessionUserEvent
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.RemovedSessionUserEvent} RemovedSessionUserEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                RemovedSessionUserEvent.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a RemovedSessionUserEvent message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.RemovedSessionUserEvent
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                RemovedSessionUserEvent.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.sessionId != null && message.hasOwnProperty("sessionId")) {
                        let error = $root.LiftLog.Ui.Models.UuidDao.verify(message.sessionId);
                        if (error)
                            return "sessionId." + error;
                    }
                    return null;
                };

                /**
                 * Creates a RemovedSessionUserEvent message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.RemovedSessionUserEvent
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.RemovedSessionUserEvent} RemovedSessionUserEvent
                 */
                RemovedSessionUserEvent.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.RemovedSessionUserEvent)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.RemovedSessionUserEvent();
                    if (object.sessionId != null) {
                        if (typeof object.sessionId !== "object")
                            throw TypeError(".LiftLog.Ui.Models.RemovedSessionUserEvent.sessionId: object expected");
                        message.sessionId = $root.LiftLog.Ui.Models.UuidDao.fromObject(object.sessionId);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a RemovedSessionUserEvent message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.RemovedSessionUserEvent
                 * @static
                 * @param {LiftLog.Ui.Models.RemovedSessionUserEvent} message RemovedSessionUserEvent
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                RemovedSessionUserEvent.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults)
                        object.sessionId = null;
                    if (message.sessionId != null && message.hasOwnProperty("sessionId"))
                        object.sessionId = $root.LiftLog.Ui.Models.UuidDao.toObject(message.sessionId, options);
                    return object;
                };

                /**
                 * Converts this RemovedSessionUserEvent to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.RemovedSessionUserEvent
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                RemovedSessionUserEvent.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for RemovedSessionUserEvent
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.RemovedSessionUserEvent
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                RemovedSessionUserEvent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.RemovedSessionUserEvent";
                };

                return RemovedSessionUserEvent;
            })();

            Models.InboxMessageDao = (function() {

                /**
                 * Properties of an InboxMessageDao.
                 * @memberof LiftLog.Ui.Models
                 * @interface IInboxMessageDao
                 * @property {LiftLog.Ui.Models.IUuidDao|null} [fromUserId] InboxMessageDao fromUserId
                 * @property {LiftLog.Ui.Models.IFollowRequestDao|null} [followRequest] InboxMessageDao followRequest
                 * @property {LiftLog.Ui.Models.IFollowResponseDao|null} [followResponse] InboxMessageDao followResponse
                 * @property {LiftLog.Ui.Models.IUnFollowNotification|null} [unfollowNotification] InboxMessageDao unfollowNotification
                 * @property {Uint8Array|null} [signature] InboxMessageDao signature
                 */

                /**
                 * Constructs a new InboxMessageDao.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents an InboxMessageDao.
                 * @implements IInboxMessageDao
                 * @constructor
                 * @param {LiftLog.Ui.Models.IInboxMessageDao=} [properties] Properties to set
                 */
                function InboxMessageDao(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * InboxMessageDao fromUserId.
                 * @member {LiftLog.Ui.Models.IUuidDao|null|undefined} fromUserId
                 * @memberof LiftLog.Ui.Models.InboxMessageDao
                 * @instance
                 */
                InboxMessageDao.prototype.fromUserId = null;

                /**
                 * InboxMessageDao followRequest.
                 * @member {LiftLog.Ui.Models.IFollowRequestDao|null|undefined} followRequest
                 * @memberof LiftLog.Ui.Models.InboxMessageDao
                 * @instance
                 */
                InboxMessageDao.prototype.followRequest = null;

                /**
                 * InboxMessageDao followResponse.
                 * @member {LiftLog.Ui.Models.IFollowResponseDao|null|undefined} followResponse
                 * @memberof LiftLog.Ui.Models.InboxMessageDao
                 * @instance
                 */
                InboxMessageDao.prototype.followResponse = null;

                /**
                 * InboxMessageDao unfollowNotification.
                 * @member {LiftLog.Ui.Models.IUnFollowNotification|null|undefined} unfollowNotification
                 * @memberof LiftLog.Ui.Models.InboxMessageDao
                 * @instance
                 */
                InboxMessageDao.prototype.unfollowNotification = null;

                /**
                 * InboxMessageDao signature.
                 * @member {Uint8Array} signature
                 * @memberof LiftLog.Ui.Models.InboxMessageDao
                 * @instance
                 */
                InboxMessageDao.prototype.signature = $util.newBuffer([]);

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * InboxMessageDao messagePayload.
                 * @member {"followRequest"|"followResponse"|"unfollowNotification"|undefined} messagePayload
                 * @memberof LiftLog.Ui.Models.InboxMessageDao
                 * @instance
                 */
                Object.defineProperty(InboxMessageDao.prototype, "messagePayload", {
                    get: $util.oneOfGetter($oneOfFields = ["followRequest", "followResponse", "unfollowNotification"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new InboxMessageDao instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.InboxMessageDao
                 * @static
                 * @param {LiftLog.Ui.Models.IInboxMessageDao=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.InboxMessageDao} InboxMessageDao instance
                 */
                InboxMessageDao.create = function create(properties) {
                    return new InboxMessageDao(properties);
                };

                /**
                 * Encodes the specified InboxMessageDao message. Does not implicitly {@link LiftLog.Ui.Models.InboxMessageDao.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.InboxMessageDao
                 * @static
                 * @param {LiftLog.Ui.Models.IInboxMessageDao} message InboxMessageDao message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InboxMessageDao.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.fromUserId != null && Object.hasOwnProperty.call(message, "fromUserId"))
                        $root.LiftLog.Ui.Models.UuidDao.encode(message.fromUserId, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.followRequest != null && Object.hasOwnProperty.call(message, "followRequest"))
                        $root.LiftLog.Ui.Models.FollowRequestDao.encode(message.followRequest, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.followResponse != null && Object.hasOwnProperty.call(message, "followResponse"))
                        $root.LiftLog.Ui.Models.FollowResponseDao.encode(message.followResponse, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    if (message.unfollowNotification != null && Object.hasOwnProperty.call(message, "unfollowNotification"))
                        $root.LiftLog.Ui.Models.UnFollowNotification.encode(message.unfollowNotification, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                    if (message.signature != null && Object.hasOwnProperty.call(message, "signature"))
                        writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.signature);
                    return writer;
                };

                /**
                 * Encodes the specified InboxMessageDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.InboxMessageDao.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.InboxMessageDao
                 * @static
                 * @param {LiftLog.Ui.Models.IInboxMessageDao} message InboxMessageDao message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InboxMessageDao.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an InboxMessageDao message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.InboxMessageDao
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.InboxMessageDao} InboxMessageDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InboxMessageDao.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.InboxMessageDao();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.fromUserId = $root.LiftLog.Ui.Models.UuidDao.decode(reader, reader.uint32());
                                break;
                            }
                        case 2: {
                                message.followRequest = $root.LiftLog.Ui.Models.FollowRequestDao.decode(reader, reader.uint32());
                                break;
                            }
                        case 3: {
                                message.followResponse = $root.LiftLog.Ui.Models.FollowResponseDao.decode(reader, reader.uint32());
                                break;
                            }
                        case 4: {
                                message.unfollowNotification = $root.LiftLog.Ui.Models.UnFollowNotification.decode(reader, reader.uint32());
                                break;
                            }
                        case 5: {
                                message.signature = reader.bytes();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an InboxMessageDao message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.InboxMessageDao
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.InboxMessageDao} InboxMessageDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InboxMessageDao.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an InboxMessageDao message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.InboxMessageDao
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                InboxMessageDao.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    let properties = {};
                    if (message.fromUserId != null && message.hasOwnProperty("fromUserId")) {
                        let error = $root.LiftLog.Ui.Models.UuidDao.verify(message.fromUserId);
                        if (error)
                            return "fromUserId." + error;
                    }
                    if (message.followRequest != null && message.hasOwnProperty("followRequest")) {
                        properties.messagePayload = 1;
                        {
                            let error = $root.LiftLog.Ui.Models.FollowRequestDao.verify(message.followRequest);
                            if (error)
                                return "followRequest." + error;
                        }
                    }
                    if (message.followResponse != null && message.hasOwnProperty("followResponse")) {
                        if (properties.messagePayload === 1)
                            return "messagePayload: multiple values";
                        properties.messagePayload = 1;
                        {
                            let error = $root.LiftLog.Ui.Models.FollowResponseDao.verify(message.followResponse);
                            if (error)
                                return "followResponse." + error;
                        }
                    }
                    if (message.unfollowNotification != null && message.hasOwnProperty("unfollowNotification")) {
                        if (properties.messagePayload === 1)
                            return "messagePayload: multiple values";
                        properties.messagePayload = 1;
                        {
                            let error = $root.LiftLog.Ui.Models.UnFollowNotification.verify(message.unfollowNotification);
                            if (error)
                                return "unfollowNotification." + error;
                        }
                    }
                    if (message.signature != null && message.hasOwnProperty("signature"))
                        if (!(message.signature && typeof message.signature.length === "number" || $util.isString(message.signature)))
                            return "signature: buffer expected";
                    return null;
                };

                /**
                 * Creates an InboxMessageDao message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.InboxMessageDao
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.InboxMessageDao} InboxMessageDao
                 */
                InboxMessageDao.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.InboxMessageDao)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.InboxMessageDao();
                    if (object.fromUserId != null) {
                        if (typeof object.fromUserId !== "object")
                            throw TypeError(".LiftLog.Ui.Models.InboxMessageDao.fromUserId: object expected");
                        message.fromUserId = $root.LiftLog.Ui.Models.UuidDao.fromObject(object.fromUserId);
                    }
                    if (object.followRequest != null) {
                        if (typeof object.followRequest !== "object")
                            throw TypeError(".LiftLog.Ui.Models.InboxMessageDao.followRequest: object expected");
                        message.followRequest = $root.LiftLog.Ui.Models.FollowRequestDao.fromObject(object.followRequest);
                    }
                    if (object.followResponse != null) {
                        if (typeof object.followResponse !== "object")
                            throw TypeError(".LiftLog.Ui.Models.InboxMessageDao.followResponse: object expected");
                        message.followResponse = $root.LiftLog.Ui.Models.FollowResponseDao.fromObject(object.followResponse);
                    }
                    if (object.unfollowNotification != null) {
                        if (typeof object.unfollowNotification !== "object")
                            throw TypeError(".LiftLog.Ui.Models.InboxMessageDao.unfollowNotification: object expected");
                        message.unfollowNotification = $root.LiftLog.Ui.Models.UnFollowNotification.fromObject(object.unfollowNotification);
                    }
                    if (object.signature != null)
                        if (typeof object.signature === "string")
                            $util.base64.decode(object.signature, message.signature = $util.newBuffer($util.base64.length(object.signature)), 0);
                        else if (object.signature.length >= 0)
                            message.signature = object.signature;
                    return message;
                };

                /**
                 * Creates a plain object from an InboxMessageDao message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.InboxMessageDao
                 * @static
                 * @param {LiftLog.Ui.Models.InboxMessageDao} message InboxMessageDao
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                InboxMessageDao.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.fromUserId = null;
                        if (options.bytes === String)
                            object.signature = "";
                        else {
                            object.signature = [];
                            if (options.bytes !== Array)
                                object.signature = $util.newBuffer(object.signature);
                        }
                    }
                    if (message.fromUserId != null && message.hasOwnProperty("fromUserId"))
                        object.fromUserId = $root.LiftLog.Ui.Models.UuidDao.toObject(message.fromUserId, options);
                    if (message.followRequest != null && message.hasOwnProperty("followRequest")) {
                        object.followRequest = $root.LiftLog.Ui.Models.FollowRequestDao.toObject(message.followRequest, options);
                        if (options.oneofs)
                            object.messagePayload = "followRequest";
                    }
                    if (message.followResponse != null && message.hasOwnProperty("followResponse")) {
                        object.followResponse = $root.LiftLog.Ui.Models.FollowResponseDao.toObject(message.followResponse, options);
                        if (options.oneofs)
                            object.messagePayload = "followResponse";
                    }
                    if (message.unfollowNotification != null && message.hasOwnProperty("unfollowNotification")) {
                        object.unfollowNotification = $root.LiftLog.Ui.Models.UnFollowNotification.toObject(message.unfollowNotification, options);
                        if (options.oneofs)
                            object.messagePayload = "unfollowNotification";
                    }
                    if (message.signature != null && message.hasOwnProperty("signature"))
                        object.signature = options.bytes === String ? $util.base64.encode(message.signature, 0, message.signature.length) : options.bytes === Array ? Array.prototype.slice.call(message.signature) : message.signature;
                    return object;
                };

                /**
                 * Converts this InboxMessageDao to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.InboxMessageDao
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                InboxMessageDao.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for InboxMessageDao
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.InboxMessageDao
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                InboxMessageDao.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.InboxMessageDao";
                };

                return InboxMessageDao;
            })();

            Models.FollowRequestDao = (function() {

                /**
                 * Properties of a FollowRequestDao.
                 * @memberof LiftLog.Ui.Models
                 * @interface IFollowRequestDao
                 * @property {google.protobuf.IStringValue|null} [name] FollowRequestDao name
                 */

                /**
                 * Constructs a new FollowRequestDao.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents a FollowRequestDao.
                 * @implements IFollowRequestDao
                 * @constructor
                 * @param {LiftLog.Ui.Models.IFollowRequestDao=} [properties] Properties to set
                 */
                function FollowRequestDao(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * FollowRequestDao name.
                 * @member {google.protobuf.IStringValue|null|undefined} name
                 * @memberof LiftLog.Ui.Models.FollowRequestDao
                 * @instance
                 */
                FollowRequestDao.prototype.name = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * FollowRequestDao _name.
                 * @member {"name"|undefined} _name
                 * @memberof LiftLog.Ui.Models.FollowRequestDao
                 * @instance
                 */
                Object.defineProperty(FollowRequestDao.prototype, "_name", {
                    get: $util.oneOfGetter($oneOfFields = ["name"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new FollowRequestDao instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.FollowRequestDao
                 * @static
                 * @param {LiftLog.Ui.Models.IFollowRequestDao=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.FollowRequestDao} FollowRequestDao instance
                 */
                FollowRequestDao.create = function create(properties) {
                    return new FollowRequestDao(properties);
                };

                /**
                 * Encodes the specified FollowRequestDao message. Does not implicitly {@link LiftLog.Ui.Models.FollowRequestDao.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.FollowRequestDao
                 * @static
                 * @param {LiftLog.Ui.Models.IFollowRequestDao} message FollowRequestDao message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FollowRequestDao.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                        $root.google.protobuf.StringValue.encode(message.name, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified FollowRequestDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.FollowRequestDao.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.FollowRequestDao
                 * @static
                 * @param {LiftLog.Ui.Models.IFollowRequestDao} message FollowRequestDao message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FollowRequestDao.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a FollowRequestDao message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.FollowRequestDao
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.FollowRequestDao} FollowRequestDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FollowRequestDao.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.FollowRequestDao();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.name = $root.google.protobuf.StringValue.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a FollowRequestDao message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.FollowRequestDao
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.FollowRequestDao} FollowRequestDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FollowRequestDao.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a FollowRequestDao message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.FollowRequestDao
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                FollowRequestDao.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    let properties = {};
                    if (message.name != null && message.hasOwnProperty("name")) {
                        properties._name = 1;
                        {
                            let error = $root.google.protobuf.StringValue.verify(message.name);
                            if (error)
                                return "name." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a FollowRequestDao message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.FollowRequestDao
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.FollowRequestDao} FollowRequestDao
                 */
                FollowRequestDao.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.FollowRequestDao)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.FollowRequestDao();
                    if (object.name != null) {
                        if (typeof object.name !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FollowRequestDao.name: object expected");
                        message.name = $root.google.protobuf.StringValue.fromObject(object.name);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a FollowRequestDao message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.FollowRequestDao
                 * @static
                 * @param {LiftLog.Ui.Models.FollowRequestDao} message FollowRequestDao
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                FollowRequestDao.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (message.name != null && message.hasOwnProperty("name")) {
                        object.name = $root.google.protobuf.StringValue.toObject(message.name, options);
                        if (options.oneofs)
                            object._name = "name";
                    }
                    return object;
                };

                /**
                 * Converts this FollowRequestDao to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.FollowRequestDao
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                FollowRequestDao.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for FollowRequestDao
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.FollowRequestDao
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                FollowRequestDao.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.FollowRequestDao";
                };

                return FollowRequestDao;
            })();

            Models.FollowResponseDao = (function() {

                /**
                 * Properties of a FollowResponseDao.
                 * @memberof LiftLog.Ui.Models
                 * @interface IFollowResponseDao
                 * @property {LiftLog.Ui.Models.IFollowResponseAcceptedDao|null} [accepted] FollowResponseDao accepted
                 * @property {LiftLog.Ui.Models.IFollowResponseRejectedDao|null} [rejected] FollowResponseDao rejected
                 */

                /**
                 * Constructs a new FollowResponseDao.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents a FollowResponseDao.
                 * @implements IFollowResponseDao
                 * @constructor
                 * @param {LiftLog.Ui.Models.IFollowResponseDao=} [properties] Properties to set
                 */
                function FollowResponseDao(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * FollowResponseDao accepted.
                 * @member {LiftLog.Ui.Models.IFollowResponseAcceptedDao|null|undefined} accepted
                 * @memberof LiftLog.Ui.Models.FollowResponseDao
                 * @instance
                 */
                FollowResponseDao.prototype.accepted = null;

                /**
                 * FollowResponseDao rejected.
                 * @member {LiftLog.Ui.Models.IFollowResponseRejectedDao|null|undefined} rejected
                 * @memberof LiftLog.Ui.Models.FollowResponseDao
                 * @instance
                 */
                FollowResponseDao.prototype.rejected = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * FollowResponseDao responsePayload.
                 * @member {"accepted"|"rejected"|undefined} responsePayload
                 * @memberof LiftLog.Ui.Models.FollowResponseDao
                 * @instance
                 */
                Object.defineProperty(FollowResponseDao.prototype, "responsePayload", {
                    get: $util.oneOfGetter($oneOfFields = ["accepted", "rejected"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new FollowResponseDao instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.FollowResponseDao
                 * @static
                 * @param {LiftLog.Ui.Models.IFollowResponseDao=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.FollowResponseDao} FollowResponseDao instance
                 */
                FollowResponseDao.create = function create(properties) {
                    return new FollowResponseDao(properties);
                };

                /**
                 * Encodes the specified FollowResponseDao message. Does not implicitly {@link LiftLog.Ui.Models.FollowResponseDao.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.FollowResponseDao
                 * @static
                 * @param {LiftLog.Ui.Models.IFollowResponseDao} message FollowResponseDao message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FollowResponseDao.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.accepted != null && Object.hasOwnProperty.call(message, "accepted"))
                        $root.LiftLog.Ui.Models.FollowResponseAcceptedDao.encode(message.accepted, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.rejected != null && Object.hasOwnProperty.call(message, "rejected"))
                        $root.LiftLog.Ui.Models.FollowResponseRejectedDao.encode(message.rejected, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified FollowResponseDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.FollowResponseDao.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.FollowResponseDao
                 * @static
                 * @param {LiftLog.Ui.Models.IFollowResponseDao} message FollowResponseDao message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FollowResponseDao.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a FollowResponseDao message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.FollowResponseDao
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.FollowResponseDao} FollowResponseDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FollowResponseDao.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.FollowResponseDao();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.accepted = $root.LiftLog.Ui.Models.FollowResponseAcceptedDao.decode(reader, reader.uint32());
                                break;
                            }
                        case 2: {
                                message.rejected = $root.LiftLog.Ui.Models.FollowResponseRejectedDao.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a FollowResponseDao message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.FollowResponseDao
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.FollowResponseDao} FollowResponseDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FollowResponseDao.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a FollowResponseDao message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.FollowResponseDao
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                FollowResponseDao.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    let properties = {};
                    if (message.accepted != null && message.hasOwnProperty("accepted")) {
                        properties.responsePayload = 1;
                        {
                            let error = $root.LiftLog.Ui.Models.FollowResponseAcceptedDao.verify(message.accepted);
                            if (error)
                                return "accepted." + error;
                        }
                    }
                    if (message.rejected != null && message.hasOwnProperty("rejected")) {
                        if (properties.responsePayload === 1)
                            return "responsePayload: multiple values";
                        properties.responsePayload = 1;
                        {
                            let error = $root.LiftLog.Ui.Models.FollowResponseRejectedDao.verify(message.rejected);
                            if (error)
                                return "rejected." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a FollowResponseDao message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.FollowResponseDao
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.FollowResponseDao} FollowResponseDao
                 */
                FollowResponseDao.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.FollowResponseDao)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.FollowResponseDao();
                    if (object.accepted != null) {
                        if (typeof object.accepted !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FollowResponseDao.accepted: object expected");
                        message.accepted = $root.LiftLog.Ui.Models.FollowResponseAcceptedDao.fromObject(object.accepted);
                    }
                    if (object.rejected != null) {
                        if (typeof object.rejected !== "object")
                            throw TypeError(".LiftLog.Ui.Models.FollowResponseDao.rejected: object expected");
                        message.rejected = $root.LiftLog.Ui.Models.FollowResponseRejectedDao.fromObject(object.rejected);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a FollowResponseDao message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.FollowResponseDao
                 * @static
                 * @param {LiftLog.Ui.Models.FollowResponseDao} message FollowResponseDao
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                FollowResponseDao.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (message.accepted != null && message.hasOwnProperty("accepted")) {
                        object.accepted = $root.LiftLog.Ui.Models.FollowResponseAcceptedDao.toObject(message.accepted, options);
                        if (options.oneofs)
                            object.responsePayload = "accepted";
                    }
                    if (message.rejected != null && message.hasOwnProperty("rejected")) {
                        object.rejected = $root.LiftLog.Ui.Models.FollowResponseRejectedDao.toObject(message.rejected, options);
                        if (options.oneofs)
                            object.responsePayload = "rejected";
                    }
                    return object;
                };

                /**
                 * Converts this FollowResponseDao to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.FollowResponseDao
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                FollowResponseDao.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for FollowResponseDao
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.FollowResponseDao
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                FollowResponseDao.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.FollowResponseDao";
                };

                return FollowResponseDao;
            })();

            Models.FollowResponseAcceptedDao = (function() {

                /**
                 * Properties of a FollowResponseAcceptedDao.
                 * @memberof LiftLog.Ui.Models
                 * @interface IFollowResponseAcceptedDao
                 * @property {Uint8Array|null} [aesKey] FollowResponseAcceptedDao aesKey
                 * @property {string|null} [followSecret] FollowResponseAcceptedDao followSecret
                 */

                /**
                 * Constructs a new FollowResponseAcceptedDao.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents a FollowResponseAcceptedDao.
                 * @implements IFollowResponseAcceptedDao
                 * @constructor
                 * @param {LiftLog.Ui.Models.IFollowResponseAcceptedDao=} [properties] Properties to set
                 */
                function FollowResponseAcceptedDao(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * FollowResponseAcceptedDao aesKey.
                 * @member {Uint8Array} aesKey
                 * @memberof LiftLog.Ui.Models.FollowResponseAcceptedDao
                 * @instance
                 */
                FollowResponseAcceptedDao.prototype.aesKey = $util.newBuffer([]);

                /**
                 * FollowResponseAcceptedDao followSecret.
                 * @member {string} followSecret
                 * @memberof LiftLog.Ui.Models.FollowResponseAcceptedDao
                 * @instance
                 */
                FollowResponseAcceptedDao.prototype.followSecret = "";

                /**
                 * Creates a new FollowResponseAcceptedDao instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.FollowResponseAcceptedDao
                 * @static
                 * @param {LiftLog.Ui.Models.IFollowResponseAcceptedDao=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.FollowResponseAcceptedDao} FollowResponseAcceptedDao instance
                 */
                FollowResponseAcceptedDao.create = function create(properties) {
                    return new FollowResponseAcceptedDao(properties);
                };

                /**
                 * Encodes the specified FollowResponseAcceptedDao message. Does not implicitly {@link LiftLog.Ui.Models.FollowResponseAcceptedDao.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.FollowResponseAcceptedDao
                 * @static
                 * @param {LiftLog.Ui.Models.IFollowResponseAcceptedDao} message FollowResponseAcceptedDao message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FollowResponseAcceptedDao.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.aesKey != null && Object.hasOwnProperty.call(message, "aesKey"))
                        writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.aesKey);
                    if (message.followSecret != null && Object.hasOwnProperty.call(message, "followSecret"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.followSecret);
                    return writer;
                };

                /**
                 * Encodes the specified FollowResponseAcceptedDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.FollowResponseAcceptedDao.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.FollowResponseAcceptedDao
                 * @static
                 * @param {LiftLog.Ui.Models.IFollowResponseAcceptedDao} message FollowResponseAcceptedDao message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FollowResponseAcceptedDao.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a FollowResponseAcceptedDao message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.FollowResponseAcceptedDao
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.FollowResponseAcceptedDao} FollowResponseAcceptedDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FollowResponseAcceptedDao.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.FollowResponseAcceptedDao();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.aesKey = reader.bytes();
                                break;
                            }
                        case 2: {
                                message.followSecret = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a FollowResponseAcceptedDao message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.FollowResponseAcceptedDao
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.FollowResponseAcceptedDao} FollowResponseAcceptedDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FollowResponseAcceptedDao.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a FollowResponseAcceptedDao message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.FollowResponseAcceptedDao
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                FollowResponseAcceptedDao.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.aesKey != null && message.hasOwnProperty("aesKey"))
                        if (!(message.aesKey && typeof message.aesKey.length === "number" || $util.isString(message.aesKey)))
                            return "aesKey: buffer expected";
                    if (message.followSecret != null && message.hasOwnProperty("followSecret"))
                        if (!$util.isString(message.followSecret))
                            return "followSecret: string expected";
                    return null;
                };

                /**
                 * Creates a FollowResponseAcceptedDao message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.FollowResponseAcceptedDao
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.FollowResponseAcceptedDao} FollowResponseAcceptedDao
                 */
                FollowResponseAcceptedDao.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.FollowResponseAcceptedDao)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.FollowResponseAcceptedDao();
                    if (object.aesKey != null)
                        if (typeof object.aesKey === "string")
                            $util.base64.decode(object.aesKey, message.aesKey = $util.newBuffer($util.base64.length(object.aesKey)), 0);
                        else if (object.aesKey.length >= 0)
                            message.aesKey = object.aesKey;
                    if (object.followSecret != null)
                        message.followSecret = String(object.followSecret);
                    return message;
                };

                /**
                 * Creates a plain object from a FollowResponseAcceptedDao message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.FollowResponseAcceptedDao
                 * @static
                 * @param {LiftLog.Ui.Models.FollowResponseAcceptedDao} message FollowResponseAcceptedDao
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                FollowResponseAcceptedDao.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        if (options.bytes === String)
                            object.aesKey = "";
                        else {
                            object.aesKey = [];
                            if (options.bytes !== Array)
                                object.aesKey = $util.newBuffer(object.aesKey);
                        }
                        object.followSecret = "";
                    }
                    if (message.aesKey != null && message.hasOwnProperty("aesKey"))
                        object.aesKey = options.bytes === String ? $util.base64.encode(message.aesKey, 0, message.aesKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.aesKey) : message.aesKey;
                    if (message.followSecret != null && message.hasOwnProperty("followSecret"))
                        object.followSecret = message.followSecret;
                    return object;
                };

                /**
                 * Converts this FollowResponseAcceptedDao to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.FollowResponseAcceptedDao
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                FollowResponseAcceptedDao.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for FollowResponseAcceptedDao
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.FollowResponseAcceptedDao
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                FollowResponseAcceptedDao.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.FollowResponseAcceptedDao";
                };

                return FollowResponseAcceptedDao;
            })();

            Models.FollowResponseRejectedDao = (function() {

                /**
                 * Properties of a FollowResponseRejectedDao.
                 * @memberof LiftLog.Ui.Models
                 * @interface IFollowResponseRejectedDao
                 */

                /**
                 * Constructs a new FollowResponseRejectedDao.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents a FollowResponseRejectedDao.
                 * @implements IFollowResponseRejectedDao
                 * @constructor
                 * @param {LiftLog.Ui.Models.IFollowResponseRejectedDao=} [properties] Properties to set
                 */
                function FollowResponseRejectedDao(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Creates a new FollowResponseRejectedDao instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.FollowResponseRejectedDao
                 * @static
                 * @param {LiftLog.Ui.Models.IFollowResponseRejectedDao=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.FollowResponseRejectedDao} FollowResponseRejectedDao instance
                 */
                FollowResponseRejectedDao.create = function create(properties) {
                    return new FollowResponseRejectedDao(properties);
                };

                /**
                 * Encodes the specified FollowResponseRejectedDao message. Does not implicitly {@link LiftLog.Ui.Models.FollowResponseRejectedDao.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.FollowResponseRejectedDao
                 * @static
                 * @param {LiftLog.Ui.Models.IFollowResponseRejectedDao} message FollowResponseRejectedDao message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FollowResponseRejectedDao.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    return writer;
                };

                /**
                 * Encodes the specified FollowResponseRejectedDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.FollowResponseRejectedDao.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.FollowResponseRejectedDao
                 * @static
                 * @param {LiftLog.Ui.Models.IFollowResponseRejectedDao} message FollowResponseRejectedDao message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FollowResponseRejectedDao.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a FollowResponseRejectedDao message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.FollowResponseRejectedDao
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.FollowResponseRejectedDao} FollowResponseRejectedDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FollowResponseRejectedDao.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.FollowResponseRejectedDao();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a FollowResponseRejectedDao message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.FollowResponseRejectedDao
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.FollowResponseRejectedDao} FollowResponseRejectedDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FollowResponseRejectedDao.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a FollowResponseRejectedDao message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.FollowResponseRejectedDao
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                FollowResponseRejectedDao.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    return null;
                };

                /**
                 * Creates a FollowResponseRejectedDao message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.FollowResponseRejectedDao
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.FollowResponseRejectedDao} FollowResponseRejectedDao
                 */
                FollowResponseRejectedDao.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.FollowResponseRejectedDao)
                        return object;
                    return new $root.LiftLog.Ui.Models.FollowResponseRejectedDao();
                };

                /**
                 * Creates a plain object from a FollowResponseRejectedDao message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.FollowResponseRejectedDao
                 * @static
                 * @param {LiftLog.Ui.Models.FollowResponseRejectedDao} message FollowResponseRejectedDao
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                FollowResponseRejectedDao.toObject = function toObject() {
                    return {};
                };

                /**
                 * Converts this FollowResponseRejectedDao to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.FollowResponseRejectedDao
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                FollowResponseRejectedDao.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for FollowResponseRejectedDao
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.FollowResponseRejectedDao
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                FollowResponseRejectedDao.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.FollowResponseRejectedDao";
                };

                return FollowResponseRejectedDao;
            })();

            Models.UnFollowNotification = (function() {

                /**
                 * Properties of an UnFollowNotification.
                 * @memberof LiftLog.Ui.Models
                 * @interface IUnFollowNotification
                 * @property {string|null} [followSecret] UnFollowNotification followSecret
                 */

                /**
                 * Constructs a new UnFollowNotification.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents an UnFollowNotification.
                 * @implements IUnFollowNotification
                 * @constructor
                 * @param {LiftLog.Ui.Models.IUnFollowNotification=} [properties] Properties to set
                 */
                function UnFollowNotification(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * UnFollowNotification followSecret.
                 * @member {string} followSecret
                 * @memberof LiftLog.Ui.Models.UnFollowNotification
                 * @instance
                 */
                UnFollowNotification.prototype.followSecret = "";

                /**
                 * Creates a new UnFollowNotification instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.UnFollowNotification
                 * @static
                 * @param {LiftLog.Ui.Models.IUnFollowNotification=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.UnFollowNotification} UnFollowNotification instance
                 */
                UnFollowNotification.create = function create(properties) {
                    return new UnFollowNotification(properties);
                };

                /**
                 * Encodes the specified UnFollowNotification message. Does not implicitly {@link LiftLog.Ui.Models.UnFollowNotification.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.UnFollowNotification
                 * @static
                 * @param {LiftLog.Ui.Models.IUnFollowNotification} message UnFollowNotification message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                UnFollowNotification.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.followSecret != null && Object.hasOwnProperty.call(message, "followSecret"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.followSecret);
                    return writer;
                };

                /**
                 * Encodes the specified UnFollowNotification message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.UnFollowNotification.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.UnFollowNotification
                 * @static
                 * @param {LiftLog.Ui.Models.IUnFollowNotification} message UnFollowNotification message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                UnFollowNotification.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an UnFollowNotification message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.UnFollowNotification
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.UnFollowNotification} UnFollowNotification
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                UnFollowNotification.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.UnFollowNotification();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.followSecret = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an UnFollowNotification message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.UnFollowNotification
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.UnFollowNotification} UnFollowNotification
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                UnFollowNotification.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an UnFollowNotification message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.UnFollowNotification
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                UnFollowNotification.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.followSecret != null && message.hasOwnProperty("followSecret"))
                        if (!$util.isString(message.followSecret))
                            return "followSecret: string expected";
                    return null;
                };

                /**
                 * Creates an UnFollowNotification message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.UnFollowNotification
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.UnFollowNotification} UnFollowNotification
                 */
                UnFollowNotification.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.UnFollowNotification)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.UnFollowNotification();
                    if (object.followSecret != null)
                        message.followSecret = String(object.followSecret);
                    return message;
                };

                /**
                 * Creates a plain object from an UnFollowNotification message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.UnFollowNotification
                 * @static
                 * @param {LiftLog.Ui.Models.UnFollowNotification} message UnFollowNotification
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                UnFollowNotification.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults)
                        object.followSecret = "";
                    if (message.followSecret != null && message.hasOwnProperty("followSecret"))
                        object.followSecret = message.followSecret;
                    return object;
                };

                /**
                 * Converts this UnFollowNotification to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.UnFollowNotification
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                UnFollowNotification.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for UnFollowNotification
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.UnFollowNotification
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                UnFollowNotification.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.UnFollowNotification";
                };

                return UnFollowNotification;
            })();

            Models.SharedItemPayload = (function() {

                /**
                 * Properties of a SharedItemPayload.
                 * @memberof LiftLog.Ui.Models
                 * @interface ISharedItemPayload
                 * @property {LiftLog.Ui.Models.ISharedProgramBlueprintPayload|null} [sharedProgramBlueprint] SharedItemPayload sharedProgramBlueprint
                 */

                /**
                 * Constructs a new SharedItemPayload.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents a SharedItemPayload.
                 * @implements ISharedItemPayload
                 * @constructor
                 * @param {LiftLog.Ui.Models.ISharedItemPayload=} [properties] Properties to set
                 */
                function SharedItemPayload(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * SharedItemPayload sharedProgramBlueprint.
                 * @member {LiftLog.Ui.Models.ISharedProgramBlueprintPayload|null|undefined} sharedProgramBlueprint
                 * @memberof LiftLog.Ui.Models.SharedItemPayload
                 * @instance
                 */
                SharedItemPayload.prototype.sharedProgramBlueprint = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * SharedItemPayload payload.
                 * @member {"sharedProgramBlueprint"|undefined} payload
                 * @memberof LiftLog.Ui.Models.SharedItemPayload
                 * @instance
                 */
                Object.defineProperty(SharedItemPayload.prototype, "payload", {
                    get: $util.oneOfGetter($oneOfFields = ["sharedProgramBlueprint"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new SharedItemPayload instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.SharedItemPayload
                 * @static
                 * @param {LiftLog.Ui.Models.ISharedItemPayload=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.SharedItemPayload} SharedItemPayload instance
                 */
                SharedItemPayload.create = function create(properties) {
                    return new SharedItemPayload(properties);
                };

                /**
                 * Encodes the specified SharedItemPayload message. Does not implicitly {@link LiftLog.Ui.Models.SharedItemPayload.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.SharedItemPayload
                 * @static
                 * @param {LiftLog.Ui.Models.ISharedItemPayload} message SharedItemPayload message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SharedItemPayload.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.sharedProgramBlueprint != null && Object.hasOwnProperty.call(message, "sharedProgramBlueprint"))
                        $root.LiftLog.Ui.Models.SharedProgramBlueprintPayload.encode(message.sharedProgramBlueprint, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified SharedItemPayload message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SharedItemPayload.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.SharedItemPayload
                 * @static
                 * @param {LiftLog.Ui.Models.ISharedItemPayload} message SharedItemPayload message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SharedItemPayload.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a SharedItemPayload message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.SharedItemPayload
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.SharedItemPayload} SharedItemPayload
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                SharedItemPayload.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.SharedItemPayload();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.sharedProgramBlueprint = $root.LiftLog.Ui.Models.SharedProgramBlueprintPayload.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a SharedItemPayload message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.SharedItemPayload
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.SharedItemPayload} SharedItemPayload
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                SharedItemPayload.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a SharedItemPayload message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.SharedItemPayload
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                SharedItemPayload.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    let properties = {};
                    if (message.sharedProgramBlueprint != null && message.hasOwnProperty("sharedProgramBlueprint")) {
                        properties.payload = 1;
                        {
                            let error = $root.LiftLog.Ui.Models.SharedProgramBlueprintPayload.verify(message.sharedProgramBlueprint);
                            if (error)
                                return "sharedProgramBlueprint." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a SharedItemPayload message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.SharedItemPayload
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.SharedItemPayload} SharedItemPayload
                 */
                SharedItemPayload.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.SharedItemPayload)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.SharedItemPayload();
                    if (object.sharedProgramBlueprint != null) {
                        if (typeof object.sharedProgramBlueprint !== "object")
                            throw TypeError(".LiftLog.Ui.Models.SharedItemPayload.sharedProgramBlueprint: object expected");
                        message.sharedProgramBlueprint = $root.LiftLog.Ui.Models.SharedProgramBlueprintPayload.fromObject(object.sharedProgramBlueprint);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a SharedItemPayload message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.SharedItemPayload
                 * @static
                 * @param {LiftLog.Ui.Models.SharedItemPayload} message SharedItemPayload
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                SharedItemPayload.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (message.sharedProgramBlueprint != null && message.hasOwnProperty("sharedProgramBlueprint")) {
                        object.sharedProgramBlueprint = $root.LiftLog.Ui.Models.SharedProgramBlueprintPayload.toObject(message.sharedProgramBlueprint, options);
                        if (options.oneofs)
                            object.payload = "sharedProgramBlueprint";
                    }
                    return object;
                };

                /**
                 * Converts this SharedItemPayload to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.SharedItemPayload
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                SharedItemPayload.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for SharedItemPayload
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.SharedItemPayload
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                SharedItemPayload.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.SharedItemPayload";
                };

                return SharedItemPayload;
            })();

            Models.SharedProgramBlueprintPayload = (function() {

                /**
                 * Properties of a SharedProgramBlueprintPayload.
                 * @memberof LiftLog.Ui.Models
                 * @interface ISharedProgramBlueprintPayload
                 * @property {LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1|null} [programBlueprint] SharedProgramBlueprintPayload programBlueprint
                 */

                /**
                 * Constructs a new SharedProgramBlueprintPayload.
                 * @memberof LiftLog.Ui.Models
                 * @classdesc Represents a SharedProgramBlueprintPayload.
                 * @implements ISharedProgramBlueprintPayload
                 * @constructor
                 * @param {LiftLog.Ui.Models.ISharedProgramBlueprintPayload=} [properties] Properties to set
                 */
                function SharedProgramBlueprintPayload(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * SharedProgramBlueprintPayload programBlueprint.
                 * @member {LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1|null|undefined} programBlueprint
                 * @memberof LiftLog.Ui.Models.SharedProgramBlueprintPayload
                 * @instance
                 */
                SharedProgramBlueprintPayload.prototype.programBlueprint = null;

                /**
                 * Creates a new SharedProgramBlueprintPayload instance using the specified properties.
                 * @function create
                 * @memberof LiftLog.Ui.Models.SharedProgramBlueprintPayload
                 * @static
                 * @param {LiftLog.Ui.Models.ISharedProgramBlueprintPayload=} [properties] Properties to set
                 * @returns {LiftLog.Ui.Models.SharedProgramBlueprintPayload} SharedProgramBlueprintPayload instance
                 */
                SharedProgramBlueprintPayload.create = function create(properties) {
                    return new SharedProgramBlueprintPayload(properties);
                };

                /**
                 * Encodes the specified SharedProgramBlueprintPayload message. Does not implicitly {@link LiftLog.Ui.Models.SharedProgramBlueprintPayload.verify|verify} messages.
                 * @function encode
                 * @memberof LiftLog.Ui.Models.SharedProgramBlueprintPayload
                 * @static
                 * @param {LiftLog.Ui.Models.ISharedProgramBlueprintPayload} message SharedProgramBlueprintPayload message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SharedProgramBlueprintPayload.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.programBlueprint != null && Object.hasOwnProperty.call(message, "programBlueprint"))
                        $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.encode(message.programBlueprint, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified SharedProgramBlueprintPayload message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SharedProgramBlueprintPayload.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof LiftLog.Ui.Models.SharedProgramBlueprintPayload
                 * @static
                 * @param {LiftLog.Ui.Models.ISharedProgramBlueprintPayload} message SharedProgramBlueprintPayload message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SharedProgramBlueprintPayload.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a SharedProgramBlueprintPayload message from the specified reader or buffer.
                 * @function decode
                 * @memberof LiftLog.Ui.Models.SharedProgramBlueprintPayload
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {LiftLog.Ui.Models.SharedProgramBlueprintPayload} SharedProgramBlueprintPayload
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                SharedProgramBlueprintPayload.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.LiftLog.Ui.Models.SharedProgramBlueprintPayload();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.programBlueprint = $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a SharedProgramBlueprintPayload message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof LiftLog.Ui.Models.SharedProgramBlueprintPayload
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {LiftLog.Ui.Models.SharedProgramBlueprintPayload} SharedProgramBlueprintPayload
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                SharedProgramBlueprintPayload.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a SharedProgramBlueprintPayload message.
                 * @function verify
                 * @memberof LiftLog.Ui.Models.SharedProgramBlueprintPayload
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                SharedProgramBlueprintPayload.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.programBlueprint != null && message.hasOwnProperty("programBlueprint")) {
                        let error = $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.verify(message.programBlueprint);
                        if (error)
                            return "programBlueprint." + error;
                    }
                    return null;
                };

                /**
                 * Creates a SharedProgramBlueprintPayload message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof LiftLog.Ui.Models.SharedProgramBlueprintPayload
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {LiftLog.Ui.Models.SharedProgramBlueprintPayload} SharedProgramBlueprintPayload
                 */
                SharedProgramBlueprintPayload.fromObject = function fromObject(object) {
                    if (object instanceof $root.LiftLog.Ui.Models.SharedProgramBlueprintPayload)
                        return object;
                    let message = new $root.LiftLog.Ui.Models.SharedProgramBlueprintPayload();
                    if (object.programBlueprint != null) {
                        if (typeof object.programBlueprint !== "object")
                            throw TypeError(".LiftLog.Ui.Models.SharedProgramBlueprintPayload.programBlueprint: object expected");
                        message.programBlueprint = $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.fromObject(object.programBlueprint);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a SharedProgramBlueprintPayload message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof LiftLog.Ui.Models.SharedProgramBlueprintPayload
                 * @static
                 * @param {LiftLog.Ui.Models.SharedProgramBlueprintPayload} message SharedProgramBlueprintPayload
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                SharedProgramBlueprintPayload.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults)
                        object.programBlueprint = null;
                    if (message.programBlueprint != null && message.hasOwnProperty("programBlueprint"))
                        object.programBlueprint = $root.LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.toObject(message.programBlueprint, options);
                    return object;
                };

                /**
                 * Converts this SharedProgramBlueprintPayload to JSON.
                 * @function toJSON
                 * @memberof LiftLog.Ui.Models.SharedProgramBlueprintPayload
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                SharedProgramBlueprintPayload.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for SharedProgramBlueprintPayload
                 * @function getTypeUrl
                 * @memberof LiftLog.Ui.Models.SharedProgramBlueprintPayload
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                SharedProgramBlueprintPayload.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/LiftLog.Ui.Models.SharedProgramBlueprintPayload";
                };

                return SharedProgramBlueprintPayload;
            })();

            return Models;
        })();

        return Ui;
    })();

    return LiftLog;
})();

export const google = $root.google = (() => {

    /**
     * Namespace google.
     * @exports google
     * @namespace
     */
    const google = {};

    google.protobuf = (function() {

        /**
         * Namespace protobuf.
         * @memberof google
         * @namespace
         */
        const protobuf = {};

        protobuf.DoubleValue = (function() {

            /**
             * Properties of a DoubleValue.
             * @memberof google.protobuf
             * @interface IDoubleValue
             * @property {number|null} [value] DoubleValue value
             */

            /**
             * Constructs a new DoubleValue.
             * @memberof google.protobuf
             * @classdesc Represents a DoubleValue.
             * @implements IDoubleValue
             * @constructor
             * @param {google.protobuf.IDoubleValue=} [properties] Properties to set
             */
            function DoubleValue(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DoubleValue value.
             * @member {number} value
             * @memberof google.protobuf.DoubleValue
             * @instance
             */
            DoubleValue.prototype.value = 0;

            /**
             * Creates a new DoubleValue instance using the specified properties.
             * @function create
             * @memberof google.protobuf.DoubleValue
             * @static
             * @param {google.protobuf.IDoubleValue=} [properties] Properties to set
             * @returns {google.protobuf.DoubleValue} DoubleValue instance
             */
            DoubleValue.create = function create(properties) {
                return new DoubleValue(properties);
            };

            /**
             * Encodes the specified DoubleValue message. Does not implicitly {@link google.protobuf.DoubleValue.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.DoubleValue
             * @static
             * @param {google.protobuf.IDoubleValue} message DoubleValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DoubleValue.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 1, wireType 1 =*/9).double(message.value);
                return writer;
            };

            /**
             * Encodes the specified DoubleValue message, length delimited. Does not implicitly {@link google.protobuf.DoubleValue.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.DoubleValue
             * @static
             * @param {google.protobuf.IDoubleValue} message DoubleValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DoubleValue.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DoubleValue message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.DoubleValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.DoubleValue} DoubleValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DoubleValue.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.DoubleValue();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.value = reader.double();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a DoubleValue message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.DoubleValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.DoubleValue} DoubleValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DoubleValue.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DoubleValue message.
             * @function verify
             * @memberof google.protobuf.DoubleValue
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DoubleValue.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (typeof message.value !== "number")
                        return "value: number expected";
                return null;
            };

            /**
             * Creates a DoubleValue message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.DoubleValue
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.DoubleValue} DoubleValue
             */
            DoubleValue.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.DoubleValue)
                    return object;
                let message = new $root.google.protobuf.DoubleValue();
                if (object.value != null)
                    message.value = Number(object.value);
                return message;
            };

            /**
             * Creates a plain object from a DoubleValue message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.DoubleValue
             * @static
             * @param {google.protobuf.DoubleValue} message DoubleValue
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DoubleValue.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.value = 0;
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = options.json && !isFinite(message.value) ? String(message.value) : message.value;
                return object;
            };

            /**
             * Converts this DoubleValue to JSON.
             * @function toJSON
             * @memberof google.protobuf.DoubleValue
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DoubleValue.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DoubleValue
             * @function getTypeUrl
             * @memberof google.protobuf.DoubleValue
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DoubleValue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.DoubleValue";
            };

            return DoubleValue;
        })();

        protobuf.FloatValue = (function() {

            /**
             * Properties of a FloatValue.
             * @memberof google.protobuf
             * @interface IFloatValue
             * @property {number|null} [value] FloatValue value
             */

            /**
             * Constructs a new FloatValue.
             * @memberof google.protobuf
             * @classdesc Represents a FloatValue.
             * @implements IFloatValue
             * @constructor
             * @param {google.protobuf.IFloatValue=} [properties] Properties to set
             */
            function FloatValue(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * FloatValue value.
             * @member {number} value
             * @memberof google.protobuf.FloatValue
             * @instance
             */
            FloatValue.prototype.value = 0;

            /**
             * Creates a new FloatValue instance using the specified properties.
             * @function create
             * @memberof google.protobuf.FloatValue
             * @static
             * @param {google.protobuf.IFloatValue=} [properties] Properties to set
             * @returns {google.protobuf.FloatValue} FloatValue instance
             */
            FloatValue.create = function create(properties) {
                return new FloatValue(properties);
            };

            /**
             * Encodes the specified FloatValue message. Does not implicitly {@link google.protobuf.FloatValue.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.FloatValue
             * @static
             * @param {google.protobuf.IFloatValue} message FloatValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FloatValue.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 1, wireType 5 =*/13).float(message.value);
                return writer;
            };

            /**
             * Encodes the specified FloatValue message, length delimited. Does not implicitly {@link google.protobuf.FloatValue.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.FloatValue
             * @static
             * @param {google.protobuf.IFloatValue} message FloatValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FloatValue.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a FloatValue message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.FloatValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.FloatValue} FloatValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FloatValue.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.FloatValue();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.value = reader.float();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a FloatValue message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.FloatValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.FloatValue} FloatValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FloatValue.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a FloatValue message.
             * @function verify
             * @memberof google.protobuf.FloatValue
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            FloatValue.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (typeof message.value !== "number")
                        return "value: number expected";
                return null;
            };

            /**
             * Creates a FloatValue message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.FloatValue
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.FloatValue} FloatValue
             */
            FloatValue.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.FloatValue)
                    return object;
                let message = new $root.google.protobuf.FloatValue();
                if (object.value != null)
                    message.value = Number(object.value);
                return message;
            };

            /**
             * Creates a plain object from a FloatValue message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.FloatValue
             * @static
             * @param {google.protobuf.FloatValue} message FloatValue
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            FloatValue.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.value = 0;
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = options.json && !isFinite(message.value) ? String(message.value) : message.value;
                return object;
            };

            /**
             * Converts this FloatValue to JSON.
             * @function toJSON
             * @memberof google.protobuf.FloatValue
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            FloatValue.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for FloatValue
             * @function getTypeUrl
             * @memberof google.protobuf.FloatValue
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            FloatValue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.FloatValue";
            };

            return FloatValue;
        })();

        protobuf.Int64Value = (function() {

            /**
             * Properties of an Int64Value.
             * @memberof google.protobuf
             * @interface IInt64Value
             * @property {Long|null} [value] Int64Value value
             */

            /**
             * Constructs a new Int64Value.
             * @memberof google.protobuf
             * @classdesc Represents an Int64Value.
             * @implements IInt64Value
             * @constructor
             * @param {google.protobuf.IInt64Value=} [properties] Properties to set
             */
            function Int64Value(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Int64Value value.
             * @member {Long} value
             * @memberof google.protobuf.Int64Value
             * @instance
             */
            Int64Value.prototype.value = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Int64Value instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Int64Value
             * @static
             * @param {google.protobuf.IInt64Value=} [properties] Properties to set
             * @returns {google.protobuf.Int64Value} Int64Value instance
             */
            Int64Value.create = function create(properties) {
                return new Int64Value(properties);
            };

            /**
             * Encodes the specified Int64Value message. Does not implicitly {@link google.protobuf.Int64Value.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Int64Value
             * @static
             * @param {google.protobuf.IInt64Value} message Int64Value message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Int64Value.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int64(message.value);
                return writer;
            };

            /**
             * Encodes the specified Int64Value message, length delimited. Does not implicitly {@link google.protobuf.Int64Value.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Int64Value
             * @static
             * @param {google.protobuf.IInt64Value} message Int64Value message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Int64Value.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Int64Value message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Int64Value
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Int64Value} Int64Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Int64Value.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Int64Value();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.value = reader.int64();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Int64Value message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Int64Value
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Int64Value} Int64Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Int64Value.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Int64Value message.
             * @function verify
             * @memberof google.protobuf.Int64Value
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Int64Value.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (!$util.isInteger(message.value) && !(message.value && $util.isInteger(message.value.low) && $util.isInteger(message.value.high)))
                        return "value: integer|Long expected";
                return null;
            };

            /**
             * Creates an Int64Value message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Int64Value
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Int64Value} Int64Value
             */
            Int64Value.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Int64Value)
                    return object;
                let message = new $root.google.protobuf.Int64Value();
                if (object.value != null)
                    if ($util.Long)
                        (message.value = $util.Long.fromValue(object.value)).unsigned = false;
                    else if (typeof object.value === "string")
                        message.value = parseInt(object.value, 10);
                    else if (typeof object.value === "number")
                        message.value = object.value;
                    else if (typeof object.value === "object")
                        message.value = new $util.LongBits(object.value.low >>> 0, object.value.high >>> 0).toNumber();
                return message;
            };

            /**
             * Creates a plain object from an Int64Value message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Int64Value
             * @static
             * @param {google.protobuf.Int64Value} message Int64Value
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Int64Value.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.value = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.value = options.longs === String ? "0" : 0;
                if (message.value != null && message.hasOwnProperty("value"))
                    if (typeof message.value === "number")
                        object.value = options.longs === String ? String(message.value) : message.value;
                    else
                        object.value = options.longs === String ? $util.Long.prototype.toString.call(message.value) : options.longs === Number ? new $util.LongBits(message.value.low >>> 0, message.value.high >>> 0).toNumber() : message.value;
                return object;
            };

            /**
             * Converts this Int64Value to JSON.
             * @function toJSON
             * @memberof google.protobuf.Int64Value
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Int64Value.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Int64Value
             * @function getTypeUrl
             * @memberof google.protobuf.Int64Value
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Int64Value.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Int64Value";
            };

            return Int64Value;
        })();

        protobuf.UInt64Value = (function() {

            /**
             * Properties of a UInt64Value.
             * @memberof google.protobuf
             * @interface IUInt64Value
             * @property {Long|null} [value] UInt64Value value
             */

            /**
             * Constructs a new UInt64Value.
             * @memberof google.protobuf
             * @classdesc Represents a UInt64Value.
             * @implements IUInt64Value
             * @constructor
             * @param {google.protobuf.IUInt64Value=} [properties] Properties to set
             */
            function UInt64Value(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * UInt64Value value.
             * @member {Long} value
             * @memberof google.protobuf.UInt64Value
             * @instance
             */
            UInt64Value.prototype.value = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * Creates a new UInt64Value instance using the specified properties.
             * @function create
             * @memberof google.protobuf.UInt64Value
             * @static
             * @param {google.protobuf.IUInt64Value=} [properties] Properties to set
             * @returns {google.protobuf.UInt64Value} UInt64Value instance
             */
            UInt64Value.create = function create(properties) {
                return new UInt64Value(properties);
            };

            /**
             * Encodes the specified UInt64Value message. Does not implicitly {@link google.protobuf.UInt64Value.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.UInt64Value
             * @static
             * @param {google.protobuf.IUInt64Value} message UInt64Value message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UInt64Value.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.value);
                return writer;
            };

            /**
             * Encodes the specified UInt64Value message, length delimited. Does not implicitly {@link google.protobuf.UInt64Value.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.UInt64Value
             * @static
             * @param {google.protobuf.IUInt64Value} message UInt64Value message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UInt64Value.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a UInt64Value message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.UInt64Value
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.UInt64Value} UInt64Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UInt64Value.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.UInt64Value();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.value = reader.uint64();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a UInt64Value message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.UInt64Value
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.UInt64Value} UInt64Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UInt64Value.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a UInt64Value message.
             * @function verify
             * @memberof google.protobuf.UInt64Value
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UInt64Value.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (!$util.isInteger(message.value) && !(message.value && $util.isInteger(message.value.low) && $util.isInteger(message.value.high)))
                        return "value: integer|Long expected";
                return null;
            };

            /**
             * Creates a UInt64Value message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.UInt64Value
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.UInt64Value} UInt64Value
             */
            UInt64Value.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.UInt64Value)
                    return object;
                let message = new $root.google.protobuf.UInt64Value();
                if (object.value != null)
                    if ($util.Long)
                        (message.value = $util.Long.fromValue(object.value)).unsigned = true;
                    else if (typeof object.value === "string")
                        message.value = parseInt(object.value, 10);
                    else if (typeof object.value === "number")
                        message.value = object.value;
                    else if (typeof object.value === "object")
                        message.value = new $util.LongBits(object.value.low >>> 0, object.value.high >>> 0).toNumber(true);
                return message;
            };

            /**
             * Creates a plain object from a UInt64Value message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.UInt64Value
             * @static
             * @param {google.protobuf.UInt64Value} message UInt64Value
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UInt64Value.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.value = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.value = options.longs === String ? "0" : 0;
                if (message.value != null && message.hasOwnProperty("value"))
                    if (typeof message.value === "number")
                        object.value = options.longs === String ? String(message.value) : message.value;
                    else
                        object.value = options.longs === String ? $util.Long.prototype.toString.call(message.value) : options.longs === Number ? new $util.LongBits(message.value.low >>> 0, message.value.high >>> 0).toNumber(true) : message.value;
                return object;
            };

            /**
             * Converts this UInt64Value to JSON.
             * @function toJSON
             * @memberof google.protobuf.UInt64Value
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UInt64Value.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UInt64Value
             * @function getTypeUrl
             * @memberof google.protobuf.UInt64Value
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UInt64Value.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.UInt64Value";
            };

            return UInt64Value;
        })();

        protobuf.Int32Value = (function() {

            /**
             * Properties of an Int32Value.
             * @memberof google.protobuf
             * @interface IInt32Value
             * @property {number|null} [value] Int32Value value
             */

            /**
             * Constructs a new Int32Value.
             * @memberof google.protobuf
             * @classdesc Represents an Int32Value.
             * @implements IInt32Value
             * @constructor
             * @param {google.protobuf.IInt32Value=} [properties] Properties to set
             */
            function Int32Value(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Int32Value value.
             * @member {number} value
             * @memberof google.protobuf.Int32Value
             * @instance
             */
            Int32Value.prototype.value = 0;

            /**
             * Creates a new Int32Value instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Int32Value
             * @static
             * @param {google.protobuf.IInt32Value=} [properties] Properties to set
             * @returns {google.protobuf.Int32Value} Int32Value instance
             */
            Int32Value.create = function create(properties) {
                return new Int32Value(properties);
            };

            /**
             * Encodes the specified Int32Value message. Does not implicitly {@link google.protobuf.Int32Value.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Int32Value
             * @static
             * @param {google.protobuf.IInt32Value} message Int32Value message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Int32Value.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.value);
                return writer;
            };

            /**
             * Encodes the specified Int32Value message, length delimited. Does not implicitly {@link google.protobuf.Int32Value.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Int32Value
             * @static
             * @param {google.protobuf.IInt32Value} message Int32Value message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Int32Value.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Int32Value message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Int32Value
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Int32Value} Int32Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Int32Value.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Int32Value();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.value = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Int32Value message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Int32Value
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Int32Value} Int32Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Int32Value.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Int32Value message.
             * @function verify
             * @memberof google.protobuf.Int32Value
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Int32Value.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (!$util.isInteger(message.value))
                        return "value: integer expected";
                return null;
            };

            /**
             * Creates an Int32Value message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Int32Value
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Int32Value} Int32Value
             */
            Int32Value.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Int32Value)
                    return object;
                let message = new $root.google.protobuf.Int32Value();
                if (object.value != null)
                    message.value = object.value | 0;
                return message;
            };

            /**
             * Creates a plain object from an Int32Value message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Int32Value
             * @static
             * @param {google.protobuf.Int32Value} message Int32Value
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Int32Value.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.value = 0;
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = message.value;
                return object;
            };

            /**
             * Converts this Int32Value to JSON.
             * @function toJSON
             * @memberof google.protobuf.Int32Value
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Int32Value.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Int32Value
             * @function getTypeUrl
             * @memberof google.protobuf.Int32Value
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Int32Value.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Int32Value";
            };

            return Int32Value;
        })();

        protobuf.UInt32Value = (function() {

            /**
             * Properties of a UInt32Value.
             * @memberof google.protobuf
             * @interface IUInt32Value
             * @property {number|null} [value] UInt32Value value
             */

            /**
             * Constructs a new UInt32Value.
             * @memberof google.protobuf
             * @classdesc Represents a UInt32Value.
             * @implements IUInt32Value
             * @constructor
             * @param {google.protobuf.IUInt32Value=} [properties] Properties to set
             */
            function UInt32Value(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * UInt32Value value.
             * @member {number} value
             * @memberof google.protobuf.UInt32Value
             * @instance
             */
            UInt32Value.prototype.value = 0;

            /**
             * Creates a new UInt32Value instance using the specified properties.
             * @function create
             * @memberof google.protobuf.UInt32Value
             * @static
             * @param {google.protobuf.IUInt32Value=} [properties] Properties to set
             * @returns {google.protobuf.UInt32Value} UInt32Value instance
             */
            UInt32Value.create = function create(properties) {
                return new UInt32Value(properties);
            };

            /**
             * Encodes the specified UInt32Value message. Does not implicitly {@link google.protobuf.UInt32Value.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.UInt32Value
             * @static
             * @param {google.protobuf.IUInt32Value} message UInt32Value message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UInt32Value.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.value);
                return writer;
            };

            /**
             * Encodes the specified UInt32Value message, length delimited. Does not implicitly {@link google.protobuf.UInt32Value.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.UInt32Value
             * @static
             * @param {google.protobuf.IUInt32Value} message UInt32Value message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UInt32Value.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a UInt32Value message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.UInt32Value
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.UInt32Value} UInt32Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UInt32Value.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.UInt32Value();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.value = reader.uint32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a UInt32Value message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.UInt32Value
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.UInt32Value} UInt32Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UInt32Value.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a UInt32Value message.
             * @function verify
             * @memberof google.protobuf.UInt32Value
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UInt32Value.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (!$util.isInteger(message.value))
                        return "value: integer expected";
                return null;
            };

            /**
             * Creates a UInt32Value message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.UInt32Value
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.UInt32Value} UInt32Value
             */
            UInt32Value.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.UInt32Value)
                    return object;
                let message = new $root.google.protobuf.UInt32Value();
                if (object.value != null)
                    message.value = object.value >>> 0;
                return message;
            };

            /**
             * Creates a plain object from a UInt32Value message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.UInt32Value
             * @static
             * @param {google.protobuf.UInt32Value} message UInt32Value
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UInt32Value.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.value = 0;
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = message.value;
                return object;
            };

            /**
             * Converts this UInt32Value to JSON.
             * @function toJSON
             * @memberof google.protobuf.UInt32Value
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UInt32Value.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UInt32Value
             * @function getTypeUrl
             * @memberof google.protobuf.UInt32Value
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UInt32Value.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.UInt32Value";
            };

            return UInt32Value;
        })();

        protobuf.BoolValue = (function() {

            /**
             * Properties of a BoolValue.
             * @memberof google.protobuf
             * @interface IBoolValue
             * @property {boolean|null} [value] BoolValue value
             */

            /**
             * Constructs a new BoolValue.
             * @memberof google.protobuf
             * @classdesc Represents a BoolValue.
             * @implements IBoolValue
             * @constructor
             * @param {google.protobuf.IBoolValue=} [properties] Properties to set
             */
            function BoolValue(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * BoolValue value.
             * @member {boolean} value
             * @memberof google.protobuf.BoolValue
             * @instance
             */
            BoolValue.prototype.value = false;

            /**
             * Creates a new BoolValue instance using the specified properties.
             * @function create
             * @memberof google.protobuf.BoolValue
             * @static
             * @param {google.protobuf.IBoolValue=} [properties] Properties to set
             * @returns {google.protobuf.BoolValue} BoolValue instance
             */
            BoolValue.create = function create(properties) {
                return new BoolValue(properties);
            };

            /**
             * Encodes the specified BoolValue message. Does not implicitly {@link google.protobuf.BoolValue.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.BoolValue
             * @static
             * @param {google.protobuf.IBoolValue} message BoolValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            BoolValue.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.value);
                return writer;
            };

            /**
             * Encodes the specified BoolValue message, length delimited. Does not implicitly {@link google.protobuf.BoolValue.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.BoolValue
             * @static
             * @param {google.protobuf.IBoolValue} message BoolValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            BoolValue.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a BoolValue message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.BoolValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.BoolValue} BoolValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            BoolValue.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.BoolValue();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.value = reader.bool();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a BoolValue message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.BoolValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.BoolValue} BoolValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            BoolValue.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a BoolValue message.
             * @function verify
             * @memberof google.protobuf.BoolValue
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            BoolValue.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (typeof message.value !== "boolean")
                        return "value: boolean expected";
                return null;
            };

            /**
             * Creates a BoolValue message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.BoolValue
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.BoolValue} BoolValue
             */
            BoolValue.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.BoolValue)
                    return object;
                let message = new $root.google.protobuf.BoolValue();
                if (object.value != null)
                    message.value = Boolean(object.value);
                return message;
            };

            /**
             * Creates a plain object from a BoolValue message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.BoolValue
             * @static
             * @param {google.protobuf.BoolValue} message BoolValue
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            BoolValue.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.value = false;
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = message.value;
                return object;
            };

            /**
             * Converts this BoolValue to JSON.
             * @function toJSON
             * @memberof google.protobuf.BoolValue
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            BoolValue.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for BoolValue
             * @function getTypeUrl
             * @memberof google.protobuf.BoolValue
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            BoolValue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.BoolValue";
            };

            return BoolValue;
        })();

        protobuf.StringValue = (function() {

            /**
             * Properties of a StringValue.
             * @memberof google.protobuf
             * @interface IStringValue
             * @property {string|null} [value] StringValue value
             */

            /**
             * Constructs a new StringValue.
             * @memberof google.protobuf
             * @classdesc Represents a StringValue.
             * @implements IStringValue
             * @constructor
             * @param {google.protobuf.IStringValue=} [properties] Properties to set
             */
            function StringValue(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * StringValue value.
             * @member {string} value
             * @memberof google.protobuf.StringValue
             * @instance
             */
            StringValue.prototype.value = "";

            /**
             * Creates a new StringValue instance using the specified properties.
             * @function create
             * @memberof google.protobuf.StringValue
             * @static
             * @param {google.protobuf.IStringValue=} [properties] Properties to set
             * @returns {google.protobuf.StringValue} StringValue instance
             */
            StringValue.create = function create(properties) {
                return new StringValue(properties);
            };

            /**
             * Encodes the specified StringValue message. Does not implicitly {@link google.protobuf.StringValue.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.StringValue
             * @static
             * @param {google.protobuf.IStringValue} message StringValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            StringValue.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.value);
                return writer;
            };

            /**
             * Encodes the specified StringValue message, length delimited. Does not implicitly {@link google.protobuf.StringValue.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.StringValue
             * @static
             * @param {google.protobuf.IStringValue} message StringValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            StringValue.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a StringValue message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.StringValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.StringValue} StringValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            StringValue.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.StringValue();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.value = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a StringValue message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.StringValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.StringValue} StringValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            StringValue.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a StringValue message.
             * @function verify
             * @memberof google.protobuf.StringValue
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            StringValue.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (!$util.isString(message.value))
                        return "value: string expected";
                return null;
            };

            /**
             * Creates a StringValue message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.StringValue
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.StringValue} StringValue
             */
            StringValue.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.StringValue)
                    return object;
                let message = new $root.google.protobuf.StringValue();
                if (object.value != null)
                    message.value = String(object.value);
                return message;
            };

            /**
             * Creates a plain object from a StringValue message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.StringValue
             * @static
             * @param {google.protobuf.StringValue} message StringValue
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            StringValue.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.value = "";
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = message.value;
                return object;
            };

            /**
             * Converts this StringValue to JSON.
             * @function toJSON
             * @memberof google.protobuf.StringValue
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            StringValue.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for StringValue
             * @function getTypeUrl
             * @memberof google.protobuf.StringValue
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            StringValue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.StringValue";
            };

            return StringValue;
        })();

        protobuf.BytesValue = (function() {

            /**
             * Properties of a BytesValue.
             * @memberof google.protobuf
             * @interface IBytesValue
             * @property {Uint8Array|null} [value] BytesValue value
             */

            /**
             * Constructs a new BytesValue.
             * @memberof google.protobuf
             * @classdesc Represents a BytesValue.
             * @implements IBytesValue
             * @constructor
             * @param {google.protobuf.IBytesValue=} [properties] Properties to set
             */
            function BytesValue(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * BytesValue value.
             * @member {Uint8Array} value
             * @memberof google.protobuf.BytesValue
             * @instance
             */
            BytesValue.prototype.value = $util.newBuffer([]);

            /**
             * Creates a new BytesValue instance using the specified properties.
             * @function create
             * @memberof google.protobuf.BytesValue
             * @static
             * @param {google.protobuf.IBytesValue=} [properties] Properties to set
             * @returns {google.protobuf.BytesValue} BytesValue instance
             */
            BytesValue.create = function create(properties) {
                return new BytesValue(properties);
            };

            /**
             * Encodes the specified BytesValue message. Does not implicitly {@link google.protobuf.BytesValue.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.BytesValue
             * @static
             * @param {google.protobuf.IBytesValue} message BytesValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            BytesValue.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.value);
                return writer;
            };

            /**
             * Encodes the specified BytesValue message, length delimited. Does not implicitly {@link google.protobuf.BytesValue.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.BytesValue
             * @static
             * @param {google.protobuf.IBytesValue} message BytesValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            BytesValue.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a BytesValue message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.BytesValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.BytesValue} BytesValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            BytesValue.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.BytesValue();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.value = reader.bytes();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a BytesValue message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.BytesValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.BytesValue} BytesValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            BytesValue.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a BytesValue message.
             * @function verify
             * @memberof google.protobuf.BytesValue
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            BytesValue.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (!(message.value && typeof message.value.length === "number" || $util.isString(message.value)))
                        return "value: buffer expected";
                return null;
            };

            /**
             * Creates a BytesValue message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.BytesValue
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.BytesValue} BytesValue
             */
            BytesValue.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.BytesValue)
                    return object;
                let message = new $root.google.protobuf.BytesValue();
                if (object.value != null)
                    if (typeof object.value === "string")
                        $util.base64.decode(object.value, message.value = $util.newBuffer($util.base64.length(object.value)), 0);
                    else if (object.value.length >= 0)
                        message.value = object.value;
                return message;
            };

            /**
             * Creates a plain object from a BytesValue message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.BytesValue
             * @static
             * @param {google.protobuf.BytesValue} message BytesValue
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            BytesValue.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    if (options.bytes === String)
                        object.value = "";
                    else {
                        object.value = [];
                        if (options.bytes !== Array)
                            object.value = $util.newBuffer(object.value);
                    }
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = options.bytes === String ? $util.base64.encode(message.value, 0, message.value.length) : options.bytes === Array ? Array.prototype.slice.call(message.value) : message.value;
                return object;
            };

            /**
             * Converts this BytesValue to JSON.
             * @function toJSON
             * @memberof google.protobuf.BytesValue
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            BytesValue.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for BytesValue
             * @function getTypeUrl
             * @memberof google.protobuf.BytesValue
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            BytesValue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.BytesValue";
            };

            return BytesValue;
        })();

        protobuf.Duration = (function() {

            /**
             * Properties of a Duration.
             * @memberof google.protobuf
             * @interface IDuration
             * @property {Long|null} [seconds] Duration seconds
             * @property {number|null} [nanos] Duration nanos
             */

            /**
             * Constructs a new Duration.
             * @memberof google.protobuf
             * @classdesc Represents a Duration.
             * @implements IDuration
             * @constructor
             * @param {google.protobuf.IDuration=} [properties] Properties to set
             */
            function Duration(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Duration seconds.
             * @member {Long} seconds
             * @memberof google.protobuf.Duration
             * @instance
             */
            Duration.prototype.seconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Duration nanos.
             * @member {number} nanos
             * @memberof google.protobuf.Duration
             * @instance
             */
            Duration.prototype.nanos = 0;

            /**
             * Creates a new Duration instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Duration
             * @static
             * @param {google.protobuf.IDuration=} [properties] Properties to set
             * @returns {google.protobuf.Duration} Duration instance
             */
            Duration.create = function create(properties) {
                return new Duration(properties);
            };

            /**
             * Encodes the specified Duration message. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Duration
             * @static
             * @param {google.protobuf.IDuration} message Duration message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Duration.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.seconds != null && Object.hasOwnProperty.call(message, "seconds"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int64(message.seconds);
                if (message.nanos != null && Object.hasOwnProperty.call(message, "nanos"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.nanos);
                return writer;
            };

            /**
             * Encodes the specified Duration message, length delimited. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Duration
             * @static
             * @param {google.protobuf.IDuration} message Duration message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Duration.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Duration message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Duration
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Duration} Duration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Duration.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Duration();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.seconds = reader.int64();
                            break;
                        }
                    case 2: {
                            message.nanos = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Duration message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Duration
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Duration} Duration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Duration.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Duration message.
             * @function verify
             * @memberof google.protobuf.Duration
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Duration.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (!$util.isInteger(message.seconds) && !(message.seconds && $util.isInteger(message.seconds.low) && $util.isInteger(message.seconds.high)))
                        return "seconds: integer|Long expected";
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    if (!$util.isInteger(message.nanos))
                        return "nanos: integer expected";
                return null;
            };

            /**
             * Creates a Duration message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Duration
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Duration} Duration
             */
            Duration.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Duration)
                    return object;
                let message = new $root.google.protobuf.Duration();
                if (object.seconds != null)
                    if ($util.Long)
                        (message.seconds = $util.Long.fromValue(object.seconds)).unsigned = false;
                    else if (typeof object.seconds === "string")
                        message.seconds = parseInt(object.seconds, 10);
                    else if (typeof object.seconds === "number")
                        message.seconds = object.seconds;
                    else if (typeof object.seconds === "object")
                        message.seconds = new $util.LongBits(object.seconds.low >>> 0, object.seconds.high >>> 0).toNumber();
                if (object.nanos != null)
                    message.nanos = object.nanos | 0;
                return message;
            };

            /**
             * Creates a plain object from a Duration message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Duration
             * @static
             * @param {google.protobuf.Duration} message Duration
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Duration.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.seconds = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.seconds = options.longs === String ? "0" : 0;
                    object.nanos = 0;
                }
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (typeof message.seconds === "number")
                        object.seconds = options.longs === String ? String(message.seconds) : message.seconds;
                    else
                        object.seconds = options.longs === String ? $util.Long.prototype.toString.call(message.seconds) : options.longs === Number ? new $util.LongBits(message.seconds.low >>> 0, message.seconds.high >>> 0).toNumber() : message.seconds;
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    object.nanos = message.nanos;
                return object;
            };

            /**
             * Converts this Duration to JSON.
             * @function toJSON
             * @memberof google.protobuf.Duration
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Duration.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Duration
             * @function getTypeUrl
             * @memberof google.protobuf.Duration
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Duration.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Duration";
            };

            return Duration;
        })();

        protobuf.Timestamp = (function() {

            /**
             * Properties of a Timestamp.
             * @memberof google.protobuf
             * @interface ITimestamp
             * @property {Long|null} [seconds] Timestamp seconds
             * @property {number|null} [nanos] Timestamp nanos
             */

            /**
             * Constructs a new Timestamp.
             * @memberof google.protobuf
             * @classdesc Represents a Timestamp.
             * @implements ITimestamp
             * @constructor
             * @param {google.protobuf.ITimestamp=} [properties] Properties to set
             */
            function Timestamp(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Timestamp seconds.
             * @member {Long} seconds
             * @memberof google.protobuf.Timestamp
             * @instance
             */
            Timestamp.prototype.seconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Timestamp nanos.
             * @member {number} nanos
             * @memberof google.protobuf.Timestamp
             * @instance
             */
            Timestamp.prototype.nanos = 0;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp=} [properties] Properties to set
             * @returns {google.protobuf.Timestamp} Timestamp instance
             */
            Timestamp.create = function create(properties) {
                return new Timestamp(properties);
            };

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.seconds != null && Object.hasOwnProperty.call(message, "seconds"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int64(message.seconds);
                if (message.nanos != null && Object.hasOwnProperty.call(message, "nanos"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.nanos);
                return writer;
            };

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Timestamp();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.seconds = reader.int64();
                            break;
                        }
                    case 2: {
                            message.nanos = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Timestamp message.
             * @function verify
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Timestamp.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (!$util.isInteger(message.seconds) && !(message.seconds && $util.isInteger(message.seconds.low) && $util.isInteger(message.seconds.high)))
                        return "seconds: integer|Long expected";
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    if (!$util.isInteger(message.nanos))
                        return "nanos: integer expected";
                return null;
            };

            /**
             * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Timestamp} Timestamp
             */
            Timestamp.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Timestamp)
                    return object;
                let message = new $root.google.protobuf.Timestamp();
                if (object.seconds != null)
                    if ($util.Long)
                        (message.seconds = $util.Long.fromValue(object.seconds)).unsigned = false;
                    else if (typeof object.seconds === "string")
                        message.seconds = parseInt(object.seconds, 10);
                    else if (typeof object.seconds === "number")
                        message.seconds = object.seconds;
                    else if (typeof object.seconds === "object")
                        message.seconds = new $util.LongBits(object.seconds.low >>> 0, object.seconds.high >>> 0).toNumber();
                if (object.nanos != null)
                    message.nanos = object.nanos | 0;
                return message;
            };

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.Timestamp} message Timestamp
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Timestamp.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.seconds = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.seconds = options.longs === String ? "0" : 0;
                    object.nanos = 0;
                }
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (typeof message.seconds === "number")
                        object.seconds = options.longs === String ? String(message.seconds) : message.seconds;
                    else
                        object.seconds = options.longs === String ? $util.Long.prototype.toString.call(message.seconds) : options.longs === Number ? new $util.LongBits(message.seconds.low >>> 0, message.seconds.high >>> 0).toNumber() : message.seconds;
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    object.nanos = message.nanos;
                return object;
            };

            /**
             * Converts this Timestamp to JSON.
             * @function toJSON
             * @memberof google.protobuf.Timestamp
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Timestamp.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Timestamp
             * @function getTypeUrl
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Timestamp.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Timestamp";
            };

            return Timestamp;
        })();

        return protobuf;
    })();

    return google;
})();

export { $root as default };
