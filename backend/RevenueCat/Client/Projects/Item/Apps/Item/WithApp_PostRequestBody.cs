// <auto-generated/>
#pragma warning disable CS0618
using Microsoft.Kiota.Abstractions.Extensions;
using Microsoft.Kiota.Abstractions.Serialization;
using System.Collections.Generic;
using System.IO;
using System;
namespace RevenueCat.Client.Projects.Item.Apps.Item
{
    [global::System.CodeDom.Compiler.GeneratedCode("Kiota", "1.0.0")]
    #pragma warning disable CS1591
    public partial class WithApp_PostRequestBody : IParsable
    #pragma warning restore CS1591
    {
        /// <summary>Amazon type details. Should only be used when type is amazon.</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_amazon? Amazon { get; set; }
#nullable restore
#else
        public global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_amazon Amazon { get; set; }
#endif
        /// <summary>App Store type details. Should only be used when type is app_store.</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_app_store? AppStore { get; set; }
#nullable restore
#else
        public global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_app_store AppStore { get; set; }
#endif
        /// <summary>Legacy Mac App Store type details. Should only be used when type is mac_app_store.</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_mac_app_store? MacAppStore { get; set; }
#nullable restore
#else
        public global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_mac_app_store MacAppStore { get; set; }
#endif
        /// <summary>The name of the app</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public string? Name { get; set; }
#nullable restore
#else
        public string Name { get; set; }
#endif
        /// <summary>Paddle Billing type details. Should only be used when type is paddle.</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_paddle? Paddle { get; set; }
#nullable restore
#else
        public global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_paddle Paddle { get; set; }
#endif
        /// <summary>Play Store type details. Should only be used when type is play_store.</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_play_store? PlayStore { get; set; }
#nullable restore
#else
        public global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_play_store PlayStore { get; set; }
#endif
        /// <summary>Web Billing type details. Should only be used when type is rc_billing.</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_rc_billing? RcBilling { get; set; }
#nullable restore
#else
        public global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_rc_billing RcBilling { get; set; }
#endif
        /// <summary>Roku Channel Store type details. Should only be used when type is roku.</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_roku? Roku { get; set; }
#nullable restore
#else
        public global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_roku Roku { get; set; }
#endif
        /// <summary>Stripe type details. Should only be used when type is stripe.</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_stripe? Stripe { get; set; }
#nullable restore
#else
        public global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_stripe Stripe { get; set; }
#endif
        /// <summary>
        /// Creates a new instance of the appropriate class based on discriminator value
        /// </summary>
        /// <returns>A <see cref="global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody"/></returns>
        /// <param name="parseNode">The parse node to use to read the discriminator value and create the object</param>
        public static global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody CreateFromDiscriminatorValue(IParseNode parseNode)
        {
            _ = parseNode ?? throw new ArgumentNullException(nameof(parseNode));
            return new global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody();
        }
        /// <summary>
        /// The deserialization information for the current model
        /// </summary>
        /// <returns>A IDictionary&lt;string, Action&lt;IParseNode&gt;&gt;</returns>
        public virtual IDictionary<string, Action<IParseNode>> GetFieldDeserializers()
        {
            return new Dictionary<string, Action<IParseNode>>
            {
                { "amazon", n => { Amazon = n.GetObjectValue<global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_amazon>(global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_amazon.CreateFromDiscriminatorValue); } },
                { "app_store", n => { AppStore = n.GetObjectValue<global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_app_store>(global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_app_store.CreateFromDiscriminatorValue); } },
                { "mac_app_store", n => { MacAppStore = n.GetObjectValue<global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_mac_app_store>(global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_mac_app_store.CreateFromDiscriminatorValue); } },
                { "name", n => { Name = n.GetStringValue(); } },
                { "paddle", n => { Paddle = n.GetObjectValue<global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_paddle>(global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_paddle.CreateFromDiscriminatorValue); } },
                { "play_store", n => { PlayStore = n.GetObjectValue<global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_play_store>(global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_play_store.CreateFromDiscriminatorValue); } },
                { "rc_billing", n => { RcBilling = n.GetObjectValue<global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_rc_billing>(global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_rc_billing.CreateFromDiscriminatorValue); } },
                { "roku", n => { Roku = n.GetObjectValue<global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_roku>(global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_roku.CreateFromDiscriminatorValue); } },
                { "stripe", n => { Stripe = n.GetObjectValue<global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_stripe>(global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_stripe.CreateFromDiscriminatorValue); } },
            };
        }
        /// <summary>
        /// Serializes information the current object
        /// </summary>
        /// <param name="writer">Serialization writer to use to serialize this model</param>
        public virtual void Serialize(ISerializationWriter writer)
        {
            _ = writer ?? throw new ArgumentNullException(nameof(writer));
            writer.WriteObjectValue<global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_amazon>("amazon", Amazon);
            writer.WriteObjectValue<global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_app_store>("app_store", AppStore);
            writer.WriteObjectValue<global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_mac_app_store>("mac_app_store", MacAppStore);
            writer.WriteStringValue("name", Name);
            writer.WriteObjectValue<global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_paddle>("paddle", Paddle);
            writer.WriteObjectValue<global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_play_store>("play_store", PlayStore);
            writer.WriteObjectValue<global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_rc_billing>("rc_billing", RcBilling);
            writer.WriteObjectValue<global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_roku>("roku", Roku);
            writer.WriteObjectValue<global::RevenueCat.Client.Projects.Item.Apps.Item.WithApp_PostRequestBody_stripe>("stripe", Stripe);
        }
    }
}
#pragma warning restore CS0618
