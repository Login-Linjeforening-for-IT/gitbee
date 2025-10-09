type GithubRepository = {
    id: number
    node_id: string
    name: string
    name: string
    full_name: string
    private: boolean
    owner: {
        login: string
        id: number
        node_id: string
        avatar_url: string
        gravatar_id: string
        url: string
        html_url: string
        followers_url: string
        following_url: string
        gists_url: string
        starred_url: string
        subscriptions_url: string
        organizations_url: string
        repos_url: string
        events_url: string
        received_events_url: string
        type: string
        user_view_type: string
        site_admin: boolean
    }
    html_url: string
    description: string
    fork: boolean
    url: string
    forks_url: string
    keys_url: string
    collaborators_url: string
    teams_url: string
    hooks_url: string
    issue_events_url: string
    events_url: string
    assignees_url: string
    branches_url: string
    tags_url: string
    blobs_url: string
    git_tags_url: string
    git_refs_url: string
    trees_url: string
    statuses_url: string
    languages_url: string
    stargazers_url: string
    contributors_url: string
    subscribers_url: string
    subscription_url: string
    commits_url: string
    git_commits_url: string
    comments_url: string
    issue_comment_url: string
    contents_url: string
    compare_url: string
    merges_url: string
    archive_url: string
    downloads_url: string
    issues_url: string
    pulls_url: string
    milestones_url: string
    notifications_url: string
    labels_url: string
    releases_url: string
    deployments_url: string
    created_at: string
    updated_at: string
    pushed_at: string
    git_url: string
    ssh_url: string
    clone_url: string
    svn_url: string
    homepage: string | null
    size: number
    stargazers_count: number
    watchers_count: number
    language: string
    has_issues: boolean
    has_projects: boolean
    has_downloads: boolean
    has_wiki: boolean
    has_pages: boolean
    has_discussions: boolean
    forks_count: number
    mirror_url: string | null
    archived: boolean
    disabled: boolean
    open_issues_count: number
    license: string | null
    allow_forking: boolean
    is_template: boolean
    web_commit_signoff_required: boolean
    topics: string[]
    visibility: string
    forks: number
    open_issues: number
    watchers: number
    default_branch: string
    permissions: {
        admin: boolean
        maintain: boolean
        push: boolean
        triage: boolean
        pull: boolean
    }
    custom_properties: object
}

type GitlabRepository = {
    id: number
    description: string
    name: string
    name_with_namespace: string
    path: string
    path_with_namespace: string
    created_at: string
    default_branch: string
    tag_list: string[],
    topics: string[],
    ssh_url_to_repo: string
    http_url_to_repo: string
    web_url: string
    readme_url: string
    forks_count: number
    avatar_url: string | null,
    star_count: number,
    last_activity_at: string
    visibility: string
    namespace: {
        id: number
        name: string
        path: string
        kind: string
        full_path: string
        parent_id: number | null,
        avatar_url: string
        web_url: string
    },
    container_registry_image_prefix: string
    _links: {
        self: string
        issues: string
        merge_requests: string
        repo_branches: string
        labels: string
        events: string
        members: string
        cluster_agents: string
    },
    marked_for_deletion_at: string | null,
    marked_for_deletion_on: string | null,
    packages_enabled: boolean | null,
    empty_repo: boolean,
    archived: boolean,
    resolve_outdated_diff_discussions: boolean,
    repository_object_format: string
    issues_enabled: boolean,
    merge_requests_enabled: boolean,
    wiki_enabled: boolean,
    jobs_enabled: boolean,
    snippets_enabled: boolean,
    container_registry_enabled: boolean,
    service_desk_enabled: boolean,
    can_create_merge_request_in: boolean,
    issues_access_level: 'enabled' | 'disabled',
    repository_access_level: 'enabled' | 'disabled',
    merge_requests_access_level: 'enabled' | 'disabled',
    forking_access_level: 'enabled' | 'disabled',
    wiki_access_level: 'enabled' | 'disabled',
    builds_access_level: 'enabled' | 'disabled',
    snippets_access_level: 'enabled' | 'disabled',
    pages_access_level: 'public' | 'private'
    analytics_access_level: 'enabled' | 'disabled',
    container_registry_access_level: 'enabled' | 'disabled',
    security_and_compliance_access_level: 'public' | 'private',
    releases_access_level: 'enabled' | 'disabled',
    environments_access_level: 'enabled' | 'disabled',
    feature_flags_access_level: 'enabled' | 'disabled',
    infrastructure_access_level: 'enabled' | 'disabled',
    monitor_access_level: 'enabled' | 'disabled',
    model_experiments_access_level: 'enabled' | 'disabled',
    model_registry_access_level: 'enabled',
    emails_disabled: boolean,
    emails_enabled: boolean,
    shared_runners_enabled: boolean,
    lfs_enabled: boolean,
    creator_id: boolean,
    import_url: boolean,
    import_type: boolean,
    import_status: string
    open_issues_count: number,
    description_html: string
    updated_at: string
    ci_default_git_depth: boolean,
    ci_delete_pipelines_in_seconds: boolean,
    ci_forward_deployment_enabled: boolean,
    ci_forward_deployment_rollback_allowed: boolean,
    ci_job_token_scope_enabled: boolean,
    ci_separated_caches: boolean,
    ci_allow_fork_pipelines_to_run_in_parent_project: boolean,
    ci_id_token_sub_claim_components: string[]
    build_git_strategy: string,
    keep_latest_artifact: boolean,
    restrict_user_defined_variables: boolean,
    ci_pipeline_variables_minimum_override_role: 'guest' | 'reporter' | 'developer' | 'maintainer' | 'owner',
    runner_token_expiration_interval: null,
    group_runners_enabled: boolean,
    auto_cancel_pending_pipelines: 'enabled' | 'disabled',
    build_timeout: number
    auto_devops_enabled: boolean,
    auto_devops_deploy_strategy: string
    ci_push_repository_for_job_token_allowed: boolean,
    ci_config_path: null,
    public_jobs: boolean,
    shared_with_groups: string[],
    only_allow_merge_if_pipeline_succeeds: boolean,
    allow_merge_on_skipped_pipeline: null,
    request_access_enabled: boolean,
    only_allow_merge_if_all_discussions_are_resolved: boolean,
    remove_source_branch_after_merge: null,
    printing_merge_request_link_enabled: true,
    merge_method: string
    merge_request_title_regex: null,
    merge_request_title_regex_description: null,
    squash_option: string
    enforce_auth_checks_on_uploads: boolean
    suggestion_commit_message: string | null
    merge_commit_template: string | null
    squash_commit_template: string | null
    issue_branch_template: string | null
    warn_about_potentially_unwanted_characters: boolean,
    autoclose_referenced_issues: boolean,
    max_artifacts_size: number | null,
    requirements_enabled: boolean,
    requirements_access_level: 'enabled' | 'disabled'
    security_and_compliance_enabled: boolean,
    compliance_frameworks: unknown[]
}
