// <auto-generated/>
#pragma warning disable CS0618
using Microsoft.Kiota.Abstractions.Extensions;
using Microsoft.Kiota.Abstractions.Serialization;
using Microsoft.Kiota.Abstractions;
using RevenueCat.Client.Models;
using RevenueCat.Client.Projects.Item.Subscriptions.Item.Actions;
using RevenueCat.Client.Projects.Item.Subscriptions.Item.Authenticated_management_url;
using RevenueCat.Client.Projects.Item.Subscriptions.Item.Entitlements;
using RevenueCat.Client.Projects.Item.Subscriptions.Item.Transactions;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System.Threading;
using System;
namespace RevenueCat.Client.Projects.Item.Subscriptions.Item
{
    /// <summary>
    /// Builds and executes requests for operations under \projects\{project_id}\subscriptions\{subscription_id}
    /// </summary>
    [global::System.CodeDom.Compiler.GeneratedCode("Kiota", "1.0.0")]
    public partial class WithSubscription_ItemRequestBuilder : BaseRequestBuilder
    {
        /// <summary>The actions property</summary>
        public global::RevenueCat.Client.Projects.Item.Subscriptions.Item.Actions.ActionsRequestBuilder Actions
        {
            get => new global::RevenueCat.Client.Projects.Item.Subscriptions.Item.Actions.ActionsRequestBuilder(PathParameters, RequestAdapter);
        }
        /// <summary>The authenticated_management_url property</summary>
        public global::RevenueCat.Client.Projects.Item.Subscriptions.Item.Authenticated_management_url.Authenticated_management_urlRequestBuilder Authenticated_management_url
        {
            get => new global::RevenueCat.Client.Projects.Item.Subscriptions.Item.Authenticated_management_url.Authenticated_management_urlRequestBuilder(PathParameters, RequestAdapter);
        }
        /// <summary>The entitlements property</summary>
        public global::RevenueCat.Client.Projects.Item.Subscriptions.Item.Entitlements.EntitlementsRequestBuilder Entitlements
        {
            get => new global::RevenueCat.Client.Projects.Item.Subscriptions.Item.Entitlements.EntitlementsRequestBuilder(PathParameters, RequestAdapter);
        }
        /// <summary>The transactions property</summary>
        public global::RevenueCat.Client.Projects.Item.Subscriptions.Item.Transactions.TransactionsRequestBuilder Transactions
        {
            get => new global::RevenueCat.Client.Projects.Item.Subscriptions.Item.Transactions.TransactionsRequestBuilder(PathParameters, RequestAdapter);
        }
        /// <summary>
        /// Instantiates a new <see cref="global::RevenueCat.Client.Projects.Item.Subscriptions.Item.WithSubscription_ItemRequestBuilder"/> and sets the default values.
        /// </summary>
        /// <param name="pathParameters">Path parameters for the request</param>
        /// <param name="requestAdapter">The request adapter to use to execute the requests.</param>
        public WithSubscription_ItemRequestBuilder(Dictionary<string, object> pathParameters, IRequestAdapter requestAdapter) : base(requestAdapter, "{+baseurl}/projects/{project_id}/subscriptions/{subscription_id}", pathParameters)
        {
        }
        /// <summary>
        /// Instantiates a new <see cref="global::RevenueCat.Client.Projects.Item.Subscriptions.Item.WithSubscription_ItemRequestBuilder"/> and sets the default values.
        /// </summary>
        /// <param name="rawUrl">The raw URL to use for the request builder.</param>
        /// <param name="requestAdapter">The request adapter to use to execute the requests.</param>
        public WithSubscription_ItemRequestBuilder(string rawUrl, IRequestAdapter requestAdapter) : base(requestAdapter, "{+baseurl}/projects/{project_id}/subscriptions/{subscription_id}", rawUrl)
        {
        }
        /// <summary>
        /// This endpoint requires the following permission(s): &lt;code&gt;customer_information:subscriptions:read&lt;/code&gt;.
        /// </summary>
        /// <returns>A <see cref="global::RevenueCat.Client.Models.Subscription"/></returns>
        /// <param name="cancellationToken">Cancellation token to use when cancelling requests</param>
        /// <param name="requestConfiguration">Configuration for the request such as headers, query parameters, and middleware options.</param>
        /// <exception cref="global::RevenueCat.Client.Models.Subscription400Error">When receiving a 400 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.Subscription401Error">When receiving a 401 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.Subscription403Error">When receiving a 403 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.Subscription404Error">When receiving a 404 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.Subscription423Error">When receiving a 423 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.Subscription429Error">When receiving a 429 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.Subscription500Error">When receiving a 500 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.Subscription503Error">When receiving a 503 status code</exception>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public async Task<global::RevenueCat.Client.Models.Subscription?> GetAsync(Action<RequestConfiguration<DefaultQueryParameters>>? requestConfiguration = default, CancellationToken cancellationToken = default)
        {
#nullable restore
#else
        public async Task<global::RevenueCat.Client.Models.Subscription> GetAsync(Action<RequestConfiguration<DefaultQueryParameters>> requestConfiguration = default, CancellationToken cancellationToken = default)
        {
#endif
            var requestInfo = ToGetRequestInformation(requestConfiguration);
            var errorMapping = new Dictionary<string, ParsableFactory<IParsable>>
            {
                { "400", global::RevenueCat.Client.Models.Subscription400Error.CreateFromDiscriminatorValue },
                { "401", global::RevenueCat.Client.Models.Subscription401Error.CreateFromDiscriminatorValue },
                { "403", global::RevenueCat.Client.Models.Subscription403Error.CreateFromDiscriminatorValue },
                { "404", global::RevenueCat.Client.Models.Subscription404Error.CreateFromDiscriminatorValue },
                { "423", global::RevenueCat.Client.Models.Subscription423Error.CreateFromDiscriminatorValue },
                { "429", global::RevenueCat.Client.Models.Subscription429Error.CreateFromDiscriminatorValue },
                { "500", global::RevenueCat.Client.Models.Subscription500Error.CreateFromDiscriminatorValue },
                { "503", global::RevenueCat.Client.Models.Subscription503Error.CreateFromDiscriminatorValue },
            };
            return await RequestAdapter.SendAsync<global::RevenueCat.Client.Models.Subscription>(requestInfo, global::RevenueCat.Client.Models.Subscription.CreateFromDiscriminatorValue, errorMapping, cancellationToken).ConfigureAwait(false);
        }
        /// <summary>
        /// This endpoint requires the following permission(s): &lt;code&gt;customer_information:subscriptions:read&lt;/code&gt;.
        /// </summary>
        /// <returns>A <see cref="RequestInformation"/></returns>
        /// <param name="requestConfiguration">Configuration for the request such as headers, query parameters, and middleware options.</param>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public RequestInformation ToGetRequestInformation(Action<RequestConfiguration<DefaultQueryParameters>>? requestConfiguration = default)
        {
#nullable restore
#else
        public RequestInformation ToGetRequestInformation(Action<RequestConfiguration<DefaultQueryParameters>> requestConfiguration = default)
        {
#endif
            var requestInfo = new RequestInformation(Method.GET, UrlTemplate, PathParameters);
            requestInfo.Configure(requestConfiguration);
            requestInfo.Headers.TryAdd("Accept", "application/json");
            return requestInfo;
        }
        /// <summary>
        /// Returns a request builder with the provided arbitrary URL. Using this method means any other path or query parameters are ignored.
        /// </summary>
        /// <returns>A <see cref="global::RevenueCat.Client.Projects.Item.Subscriptions.Item.WithSubscription_ItemRequestBuilder"/></returns>
        /// <param name="rawUrl">The raw URL to use for the request builder.</param>
        public global::RevenueCat.Client.Projects.Item.Subscriptions.Item.WithSubscription_ItemRequestBuilder WithUrl(string rawUrl)
        {
            return new global::RevenueCat.Client.Projects.Item.Subscriptions.Item.WithSubscription_ItemRequestBuilder(rawUrl, RequestAdapter);
        }
    }
}
#pragma warning restore CS0618
