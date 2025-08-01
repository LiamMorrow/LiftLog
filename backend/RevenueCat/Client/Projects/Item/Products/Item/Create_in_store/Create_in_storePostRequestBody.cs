// <auto-generated/>
#pragma warning disable CS0618
using Microsoft.Kiota.Abstractions.Extensions;
using Microsoft.Kiota.Abstractions.Serialization;
using RevenueCat.Client.Models;
using System.Collections.Generic;
using System.IO;
using System;
namespace RevenueCat.Client.Projects.Item.Products.Item.Create_in_store
{
    [global::System.CodeDom.Compiler.GeneratedCode("Kiota", "1.0.0")]
    #pragma warning disable CS1591
    public partial class Create_in_storePostRequestBody : IParsable
    #pragma warning restore CS1591
    {
        /// <summary>Store-specific information for creating the product in the store</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public global::RevenueCat.Client.Projects.Item.Products.Item.Create_in_store.Create_in_storePostRequestBody.Create_in_storePostRequestBody_store_information? StoreInformation { get; set; }
#nullable restore
#else
        public global::RevenueCat.Client.Projects.Item.Products.Item.Create_in_store.Create_in_storePostRequestBody.Create_in_storePostRequestBody_store_information StoreInformation { get; set; }
#endif
        /// <summary>
        /// Creates a new instance of the appropriate class based on discriminator value
        /// </summary>
        /// <returns>A <see cref="global::RevenueCat.Client.Projects.Item.Products.Item.Create_in_store.Create_in_storePostRequestBody"/></returns>
        /// <param name="parseNode">The parse node to use to read the discriminator value and create the object</param>
        public static global::RevenueCat.Client.Projects.Item.Products.Item.Create_in_store.Create_in_storePostRequestBody CreateFromDiscriminatorValue(IParseNode parseNode)
        {
            _ = parseNode ?? throw new ArgumentNullException(nameof(parseNode));
            return new global::RevenueCat.Client.Projects.Item.Products.Item.Create_in_store.Create_in_storePostRequestBody();
        }
        /// <summary>
        /// The deserialization information for the current model
        /// </summary>
        /// <returns>A IDictionary&lt;string, Action&lt;IParseNode&gt;&gt;</returns>
        public virtual IDictionary<string, Action<IParseNode>> GetFieldDeserializers()
        {
            return new Dictionary<string, Action<IParseNode>>
            {
                { "store_information", n => { StoreInformation = n.GetObjectValue<global::RevenueCat.Client.Projects.Item.Products.Item.Create_in_store.Create_in_storePostRequestBody.Create_in_storePostRequestBody_store_information>(global::RevenueCat.Client.Projects.Item.Products.Item.Create_in_store.Create_in_storePostRequestBody.Create_in_storePostRequestBody_store_information.CreateFromDiscriminatorValue); } },
            };
        }
        /// <summary>
        /// Serializes information the current object
        /// </summary>
        /// <param name="writer">Serialization writer to use to serialize this model</param>
        public virtual void Serialize(ISerializationWriter writer)
        {
            _ = writer ?? throw new ArgumentNullException(nameof(writer));
            writer.WriteObjectValue<global::RevenueCat.Client.Projects.Item.Products.Item.Create_in_store.Create_in_storePostRequestBody.Create_in_storePostRequestBody_store_information>("store_information", StoreInformation);
        }
        /// <summary>
        /// Composed type wrapper for classes <see cref="global::RevenueCat.Client.Models.CreateAppStoreConnectInAppPurchaseInput"/>, <see cref="global::RevenueCat.Client.Models.CreateAppStoreConnectSubscriptionInput"/>
        /// </summary>
        [global::System.CodeDom.Compiler.GeneratedCode("Kiota", "1.0.0")]
        public partial class Create_in_storePostRequestBody_store_information : IComposedTypeWrapper, IParsable
        {
            /// <summary>Composed type representation for type <see cref="global::RevenueCat.Client.Models.CreateAppStoreConnectInAppPurchaseInput"/></summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
            public global::RevenueCat.Client.Models.CreateAppStoreConnectInAppPurchaseInput? CreateAppStoreConnectInAppPurchaseInput { get; set; }
#nullable restore
#else
            public global::RevenueCat.Client.Models.CreateAppStoreConnectInAppPurchaseInput CreateAppStoreConnectInAppPurchaseInput { get; set; }
#endif
            /// <summary>Composed type representation for type <see cref="global::RevenueCat.Client.Models.CreateAppStoreConnectSubscriptionInput"/></summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
            public global::RevenueCat.Client.Models.CreateAppStoreConnectSubscriptionInput? CreateAppStoreConnectSubscriptionInput { get; set; }
#nullable restore
#else
            public global::RevenueCat.Client.Models.CreateAppStoreConnectSubscriptionInput CreateAppStoreConnectSubscriptionInput { get; set; }
#endif
            /// <summary>
            /// Creates a new instance of the appropriate class based on discriminator value
            /// </summary>
            /// <returns>A <see cref="global::RevenueCat.Client.Projects.Item.Products.Item.Create_in_store.Create_in_storePostRequestBody.Create_in_storePostRequestBody_store_information"/></returns>
            /// <param name="parseNode">The parse node to use to read the discriminator value and create the object</param>
            public static global::RevenueCat.Client.Projects.Item.Products.Item.Create_in_store.Create_in_storePostRequestBody.Create_in_storePostRequestBody_store_information CreateFromDiscriminatorValue(IParseNode parseNode)
            {
                _ = parseNode ?? throw new ArgumentNullException(nameof(parseNode));
                var mappingValue = parseNode.GetChildNode("")?.GetStringValue();
                var result = new global::RevenueCat.Client.Projects.Item.Products.Item.Create_in_store.Create_in_storePostRequestBody.Create_in_storePostRequestBody_store_information();
                if("CreateAppStoreConnectInAppPurchaseInput".Equals(mappingValue, StringComparison.OrdinalIgnoreCase))
                {
                    result.CreateAppStoreConnectInAppPurchaseInput = new global::RevenueCat.Client.Models.CreateAppStoreConnectInAppPurchaseInput();
                }
                else if("CreateAppStoreConnectSubscriptionInput".Equals(mappingValue, StringComparison.OrdinalIgnoreCase))
                {
                    result.CreateAppStoreConnectSubscriptionInput = new global::RevenueCat.Client.Models.CreateAppStoreConnectSubscriptionInput();
                }
                return result;
            }
            /// <summary>
            /// The deserialization information for the current model
            /// </summary>
            /// <returns>A IDictionary&lt;string, Action&lt;IParseNode&gt;&gt;</returns>
            public virtual IDictionary<string, Action<IParseNode>> GetFieldDeserializers()
            {
                if(CreateAppStoreConnectInAppPurchaseInput != null)
                {
                    return CreateAppStoreConnectInAppPurchaseInput.GetFieldDeserializers();
                }
                else if(CreateAppStoreConnectSubscriptionInput != null)
                {
                    return CreateAppStoreConnectSubscriptionInput.GetFieldDeserializers();
                }
                return new Dictionary<string, Action<IParseNode>>();
            }
            /// <summary>
            /// Serializes information the current object
            /// </summary>
            /// <param name="writer">Serialization writer to use to serialize this model</param>
            public virtual void Serialize(ISerializationWriter writer)
            {
                _ = writer ?? throw new ArgumentNullException(nameof(writer));
                if(CreateAppStoreConnectInAppPurchaseInput != null)
                {
                    writer.WriteObjectValue<global::RevenueCat.Client.Models.CreateAppStoreConnectInAppPurchaseInput>(null, CreateAppStoreConnectInAppPurchaseInput);
                }
                else if(CreateAppStoreConnectSubscriptionInput != null)
                {
                    writer.WriteObjectValue<global::RevenueCat.Client.Models.CreateAppStoreConnectSubscriptionInput>(null, CreateAppStoreConnectSubscriptionInput);
                }
            }
        }
    }
}
#pragma warning restore CS0618
