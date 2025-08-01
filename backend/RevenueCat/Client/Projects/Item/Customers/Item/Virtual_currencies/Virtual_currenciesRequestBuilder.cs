// <auto-generated/>
#pragma warning disable CS0618
using Microsoft.Kiota.Abstractions.Extensions;
using Microsoft.Kiota.Abstractions.Serialization;
using Microsoft.Kiota.Abstractions;
using RevenueCat.Client.Models;
using RevenueCat.Client.Projects.Item.Customers.Item.Virtual_currencies.Transactions;
using RevenueCat.Client.Projects.Item.Customers.Item.Virtual_currencies.Update_balance;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System.Threading;
using System;
namespace RevenueCat.Client.Projects.Item.Customers.Item.Virtual_currencies
{
    /// <summary>
    /// Builds and executes requests for operations under \projects\{project_id}\customers\{customer_id}\virtual_currencies
    /// </summary>
    [global::System.CodeDom.Compiler.GeneratedCode("Kiota", "1.0.0")]
    public partial class Virtual_currenciesRequestBuilder : BaseRequestBuilder
    {
        /// <summary>The transactions property</summary>
        public global::RevenueCat.Client.Projects.Item.Customers.Item.Virtual_currencies.Transactions.TransactionsRequestBuilder Transactions
        {
            get => new global::RevenueCat.Client.Projects.Item.Customers.Item.Virtual_currencies.Transactions.TransactionsRequestBuilder(PathParameters, RequestAdapter);
        }
        /// <summary>The update_balance property</summary>
        public global::RevenueCat.Client.Projects.Item.Customers.Item.Virtual_currencies.Update_balance.Update_balanceRequestBuilder Update_balance
        {
            get => new global::RevenueCat.Client.Projects.Item.Customers.Item.Virtual_currencies.Update_balance.Update_balanceRequestBuilder(PathParameters, RequestAdapter);
        }
        /// <summary>
        /// Instantiates a new <see cref="global::RevenueCat.Client.Projects.Item.Customers.Item.Virtual_currencies.Virtual_currenciesRequestBuilder"/> and sets the default values.
        /// </summary>
        /// <param name="pathParameters">Path parameters for the request</param>
        /// <param name="requestAdapter">The request adapter to use to execute the requests.</param>
        public Virtual_currenciesRequestBuilder(Dictionary<string, object> pathParameters, IRequestAdapter requestAdapter) : base(requestAdapter, "{+baseurl}/projects/{project_id}/customers/{customer_id}/virtual_currencies{?include_empty_balances*,limit*,starting_after*}", pathParameters)
        {
        }
        /// <summary>
        /// Instantiates a new <see cref="global::RevenueCat.Client.Projects.Item.Customers.Item.Virtual_currencies.Virtual_currenciesRequestBuilder"/> and sets the default values.
        /// </summary>
        /// <param name="rawUrl">The raw URL to use for the request builder.</param>
        /// <param name="requestAdapter">The request adapter to use to execute the requests.</param>
        public Virtual_currenciesRequestBuilder(string rawUrl, IRequestAdapter requestAdapter) : base(requestAdapter, "{+baseurl}/projects/{project_id}/customers/{customer_id}/virtual_currencies{?include_empty_balances*,limit*,starting_after*}", rawUrl)
        {
        }
        /// <summary>
        /// This endpoint requires the following permission(s): &lt;code&gt;customer_information:purchases:read&lt;/code&gt;.
        /// </summary>
        /// <returns>A <see cref="global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances"/></returns>
        /// <param name="cancellationToken">Cancellation token to use when cancelling requests</param>
        /// <param name="requestConfiguration">Configuration for the request such as headers, query parameters, and middleware options.</param>
        /// <exception cref="global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances400Error">When receiving a 400 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances401Error">When receiving a 401 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances403Error">When receiving a 403 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances404Error">When receiving a 404 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances423Error">When receiving a 423 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances429Error">When receiving a 429 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances500Error">When receiving a 500 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances503Error">When receiving a 503 status code</exception>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public async Task<global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances?> GetAsync(Action<RequestConfiguration<global::RevenueCat.Client.Projects.Item.Customers.Item.Virtual_currencies.Virtual_currenciesRequestBuilder.Virtual_currenciesRequestBuilderGetQueryParameters>>? requestConfiguration = default, CancellationToken cancellationToken = default)
        {
#nullable restore
#else
        public async Task<global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances> GetAsync(Action<RequestConfiguration<global::RevenueCat.Client.Projects.Item.Customers.Item.Virtual_currencies.Virtual_currenciesRequestBuilder.Virtual_currenciesRequestBuilderGetQueryParameters>> requestConfiguration = default, CancellationToken cancellationToken = default)
        {
#endif
            var requestInfo = ToGetRequestInformation(requestConfiguration);
            var errorMapping = new Dictionary<string, ParsableFactory<IParsable>>
            {
                { "400", global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances400Error.CreateFromDiscriminatorValue },
                { "401", global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances401Error.CreateFromDiscriminatorValue },
                { "403", global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances403Error.CreateFromDiscriminatorValue },
                { "404", global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances404Error.CreateFromDiscriminatorValue },
                { "423", global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances423Error.CreateFromDiscriminatorValue },
                { "429", global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances429Error.CreateFromDiscriminatorValue },
                { "500", global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances500Error.CreateFromDiscriminatorValue },
                { "503", global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances503Error.CreateFromDiscriminatorValue },
            };
            return await RequestAdapter.SendAsync<global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances>(requestInfo, global::RevenueCat.Client.Models.ListVirtualCurrenciesBalances.CreateFromDiscriminatorValue, errorMapping, cancellationToken).ConfigureAwait(false);
        }
        /// <summary>
        /// This endpoint requires the following permission(s): &lt;code&gt;customer_information:purchases:read&lt;/code&gt;.
        /// </summary>
        /// <returns>A <see cref="RequestInformation"/></returns>
        /// <param name="requestConfiguration">Configuration for the request such as headers, query parameters, and middleware options.</param>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public RequestInformation ToGetRequestInformation(Action<RequestConfiguration<global::RevenueCat.Client.Projects.Item.Customers.Item.Virtual_currencies.Virtual_currenciesRequestBuilder.Virtual_currenciesRequestBuilderGetQueryParameters>>? requestConfiguration = default)
        {
#nullable restore
#else
        public RequestInformation ToGetRequestInformation(Action<RequestConfiguration<global::RevenueCat.Client.Projects.Item.Customers.Item.Virtual_currencies.Virtual_currenciesRequestBuilder.Virtual_currenciesRequestBuilderGetQueryParameters>> requestConfiguration = default)
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
        /// <returns>A <see cref="global::RevenueCat.Client.Projects.Item.Customers.Item.Virtual_currencies.Virtual_currenciesRequestBuilder"/></returns>
        /// <param name="rawUrl">The raw URL to use for the request builder.</param>
        public global::RevenueCat.Client.Projects.Item.Customers.Item.Virtual_currencies.Virtual_currenciesRequestBuilder WithUrl(string rawUrl)
        {
            return new global::RevenueCat.Client.Projects.Item.Customers.Item.Virtual_currencies.Virtual_currenciesRequestBuilder(rawUrl, RequestAdapter);
        }
        /// <summary>
        /// This endpoint requires the following permission(s): &lt;code&gt;customer_information:purchases:read&lt;/code&gt;.
        /// </summary>
        [global::System.CodeDom.Compiler.GeneratedCode("Kiota", "1.0.0")]
        public partial class Virtual_currenciesRequestBuilderGetQueryParameters 
        {
            [QueryParameter("include_empty_balances")]
            public bool? IncludeEmptyBalances { get; set; }
            [QueryParameter("limit")]
            public int? Limit { get; set; }
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
            [QueryParameter("starting_after")]
            public string? StartingAfter { get; set; }
#nullable restore
#else
            [QueryParameter("starting_after")]
            public string StartingAfter { get; set; }
#endif
        }
    }
}
#pragma warning restore CS0618
